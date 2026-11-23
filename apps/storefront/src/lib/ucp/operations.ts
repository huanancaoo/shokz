import "server-only"
import { sdk } from "@lib/config"
import { listRegions } from "@lib/data/regions"
import { createCartWithItems, resolveRegion } from "@lib/util/server-cart"
import { getRequestOrigin } from "@lib/util/site"
import {
  cartContinueUrl,
  cartCountryCode,
  CART,
  CATALOG_LOOKUP,
  CATALOG_SEARCH,
  CHECKOUT,
  parseLineItems,
  toUcpLineItems,
  toUcpProduct,
  toUcpTotals,
  UCP_CART_FIELDS,
  UCP_PRODUCT_FIELDS,
  ucpError,
  ucpResult,
  UcpResult,
} from "./ucp"
import { HttpTypes } from "@medusajs/types"

type Input = Record<string, unknown>

const MAX_SEARCH_LIMIT = 50
const MAX_LOOKUP_IDS = 50
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000
const CANCELED_KEY = "ucp_canceled"

const asObject = (value: unknown): Input =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Input)
    : {}

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined

const contextCountry = (input: Input) =>
  asString(asObject(input.context).address_country)

const unsupportedCountry = (name: Parameters<typeof ucpError>[0]) =>
  ucpError(
    name,
    200,
    "unsupported_country",
    "This store doesn't sell to that country"
  )

const invalidLineItems = (name: Parameters<typeof ucpError>[0]) =>
  ucpError(
    name,
    400,
    "invalid_request",
    "line_items must be an array of { item: { id }, quantity } with quantity 1-100"
  )

const itemUnavailable = (name: Parameters<typeof ucpError>[0]) =>
  ucpError(
    name,
    200,
    "item_unavailable",
    "One or more items don't exist or can't be purchased"
  )

const MAX_IDEMPOTENCY_ENTRIES = 500
const idempotentResults = new Map<
  string,
  { expiresAt: number; value: Promise<unknown> }
>()

/**
 * Runs `operation` once per idempotency key for 10 minutes. Kept in process
 * memory, so retries must reach the same server instance to be deduplicated.
 */
export const withIdempotency = <T>(
  key: string | null | undefined,
  scope: string,
  operation: () => Promise<T>
): Promise<T> => {
  if (!key) {
    return operation()
  }

  const cacheKey = `${scope}:${key}`
  const now = Date.now()
  const hit = idempotentResults.get(cacheKey)
  if (hit && hit.expiresAt > now) {
    return hit.value as Promise<T>
  }

  if (idempotentResults.size >= MAX_IDEMPOTENCY_ENTRIES) {
    idempotentResults.forEach((entry, entryKey) => {
      if (entry.expiresAt <= now) idempotentResults.delete(entryKey)
    })
    if (idempotentResults.size >= MAX_IDEMPOTENCY_ENTRIES) {
      idempotentResults.delete(idempotentResults.keys().next().value!)
    }
  }

  const value = operation()
  idempotentResults.set(cacheKey, {
    expiresAt: now + IDEMPOTENCY_TTL_MS,
    value,
  })
  value.catch(() => idempotentResults.delete(cacheKey))
  return value
}

// Catalog

export const searchCatalog = async (
  request: Request,
  input: Input
): Promise<UcpResult> => {
  const query = asString(input.query)?.slice(0, 200)
  const pagination = asObject(input.pagination)
  const limit = Math.min(
    Math.max(Number(pagination.limit) || 20, 1),
    MAX_SEARCH_LIMIT
  )
  const offset = Math.max(
    parseInt(String(pagination.cursor ?? "0"), 10) || 0,
    0
  )

  const resolved = await resolveRegion(contextCountry(input))
  if (!resolved) return unsupportedCountry(CATALOG_SEARCH)

  const { products, count } = await sdk.store.product.list({
    ...(query ? { q: query } : {}),
    limit,
    offset,
    region_id: resolved.region.id,
    fields: UCP_PRODUCT_FIELDS,
  })

  const base = `${getRequestOrigin(request)}/${resolved.countryCode}/products`
  const nextOffset = offset + products.length

  return ucpResult(CATALOG_SEARCH, {
    products: products.flatMap((product) => {
      const result = toUcpProduct(
        product,
        resolved.region.currency_code,
        `${base}/${product.handle}`
      )
      return result ? [result] : []
    }),
    pagination: {
      has_next_page: nextOffset < count,
      cursor: nextOffset < count ? String(nextOffset) : undefined,
      total_count: count,
    },
    messages: [],
  })
}

const findCatalogProducts = async (
  request: Request,
  ids: string[],
  {
    countryCode,
    region,
  }: NonNullable<Awaited<ReturnType<typeof resolveRegion>>>
) => {
  const variantIds = ids.filter((id) => id.startsWith("variant_"))
  const handles = ids.filter(
    (id) => !id.startsWith("prod_") && !id.startsWith("variant_")
  )
  const variantProductIds = variantIds.length
    ? await sdk.client
        .fetch<{ variants: { product_id?: string | null }[] }>(
          "/store/product-variants",
          {
            query: {
              id: variantIds,
              fields: "id,product_id",
              limit: MAX_LOOKUP_IDS,
            },
          }
        )
        .then(({ variants }) =>
          variants.map((v) => v.product_id).filter((id): id is string => !!id)
        )
    : []
  const productIds = Array.from(
    new Set([
      ...ids.filter((id) => id.startsWith("prod_")),
      ...variantProductIds,
    ])
  )
  const common = {
    region_id: region.id,
    fields: UCP_PRODUCT_FIELDS,
    limit: MAX_LOOKUP_IDS,
  }

  const results = await Promise.all([
    productIds.length
      ? sdk.store.product.list({ ...common, id: productIds })
      : null,
    handles.length
      ? sdk.store.product.list({ ...common, handle: handles })
      : null,
  ])

  const products = new Map<string, HttpTypes.StoreProduct>()
  for (const result of results) {
    result?.products.forEach((product) => products.set(product.id, product))
  }

  const base = `${getRequestOrigin(request)}/${countryCode}/products`
  return Array.from(products.values()).flatMap((product) => {
    const result = toUcpProduct(
      product,
      region.currency_code,
      `${base}/${product.handle}`
    )
    return result ? [result] : []
  })
}

type CatalogProduct = NonNullable<ReturnType<typeof toUcpProduct>>
type CatalogVariant = CatalogProduct["variants"][number]
type OptionSelection = CatalogVariant["options"][number]

const featuredVariant = (variants: CatalogVariant[]) =>
  variants.find((variant) => variant.availability.available) ?? variants[0]

export const lookupCatalog = async (
  request: Request,
  input: Input
): Promise<UcpResult> => {
  if (
    !Array.isArray(input.ids) ||
    !input.ids.length ||
    input.ids.length > MAX_LOOKUP_IDS ||
    !input.ids.every(
      (id): id is string => typeof id === "string" && !!id.trim()
    )
  ) {
    return ucpError(
      CATALOG_LOOKUP,
      400,
      "invalid_request",
      `"ids" must contain 1-${MAX_LOOKUP_IDS} identifiers`
    )
  }

  const resolved = await resolveRegion(contextCountry(input))
  if (!resolved) return unsupportedCountry(CATALOG_LOOKUP)

  const ids = Array.from(new Set(input.ids))
  const found = new Set<string>()
  const products = (await findCatalogProducts(request, ids, resolved)).flatMap(
    (product) => {
      const featured = featuredVariant(product.variants)
      const variants = product.variants.flatMap((variant) => {
        // An identifier resolves to one variant. Product IDs and handles resolve to the featured one.
        const inputs = ids.flatMap((id) => {
          if (id === variant.id) return [{ id, match: "exact" }]
          if (
            variant.id === featured.id &&
            (id === product.id || id === product.handle)
          ) {
            return [{ id, match: "featured" }]
          }
          return []
        })
        inputs.forEach(({ id }) => found.add(id))
        return inputs.length ? [{ ...variant, inputs }] : []
      })
      return variants.length ? [{ ...product, variants }] : []
    }
  )
  return ucpResult(CATALOG_LOOKUP, {
    products,
    messages: ids
      .filter((id) => !found.has(id))
      .map((id) => ({
        type: "info",
        code: "not_found",
        content: id,
      })),
  })
}

const matchesOptions = (
  variant: CatalogVariant,
  selections: OptionSelection[]
) =>
  selections.every(({ name, label }) =>
    variant.options.some(
      (option) => option.name === name && option.label === label
    )
  )

const detailOptions = (
  variants: CatalogVariant[],
  selections: OptionSelection[]
) => {
  const valuesByName = new Map<string, Set<string>>()
  variants.forEach(({ options }) =>
    options.forEach(({ name, label }) => {
      const values = valuesByName.get(name) ?? new Set<string>()
      values.add(label)
      valuesByName.set(name, values)
    })
  )
  return Array.from(valuesByName, ([name, values]) => ({
    name,
    values: Array.from(values, (label) => {
      const candidate = [
        ...selections.filter((option) => option.name !== name),
        { name, label },
      ]
      const matches = variants.filter((variant) =>
        matchesOptions(variant, candidate)
      )
      return {
        label,
        exists: !!matches.length,
        available: matches.some((variant) => variant.availability.available),
      }
    }),
  }))
}

export const getProduct = async (
  request: Request,
  input: Input
): Promise<UcpResult> => {
  const id = asString(input.id)
  if (!id)
    return ucpError(CATALOG_LOOKUP, 400, "invalid_request", '"id" is required')

  const resolved = await resolveRegion(contextCountry(input))
  if (!resolved) return unsupportedCountry(CATALOG_LOOKUP)

  const [product] = await findCatalogProducts(request, [id], resolved)
  const requestedVariant = product?.variants.find(
    (variant) => variant.id === id
  )
  if (
    !product ||
    (product.id !== id && product.handle !== id && !requestedVariant)
  ) {
    return ucpError(
      CATALOG_LOOKUP,
      200,
      "not_found",
      `No product or variant found for "${id}"`
    )
  }

  const selected =
    requestedVariant?.options ??
    (Array.isArray(input.selected)
      ? input.selected.map((value) => {
          const option = asObject(value)
          return { name: asString(option.name), label: asString(option.label) }
        })
      : undefined)
  if (
    selected?.some(({ name, label }) => !name || !label) ||
    (selected &&
      new Set(selected.map(({ name }) => name)).size !== selected.length)
  ) {
    return ucpError(
      CATALOG_LOOKUP,
      400,
      "invalid_request",
      '"selected" requires unique option names and labels'
    )
  }

  let effective =
    selected?.filter(
      (option): option is OptionSelection => !!option.name && !!option.label
    ) ?? featuredVariant(product.variants).options
  if (!requestedVariant) {
    const preferences = Array.isArray(input.preferences)
      ? input.preferences
      : []
    const priority = (name: string) =>
      preferences.includes(name)
        ? preferences.indexOf(name)
        : preferences.length
    effective = [...effective].sort(
      (a, b) => priority(a.name) - priority(b.name)
    )
    // Relax the lowest-priority selections until at least one variant matches.
    while (
      effective.length &&
      !product.variants.some((variant) => matchesOptions(variant, effective))
    ) {
      effective.pop()
    }
  }
  const matching = product.variants.filter((variant) =>
    matchesOptions(variant, effective)
  )
  const featured = requestedVariant ?? featuredVariant(matching)

  return ucpResult(CATALOG_LOOKUP, {
    product: {
      ...product,
      selected: effective,
      options: detailOptions(product.variants, effective),
      variants: [
        featured,
        ...matching.filter((variant) => variant.id !== featured.id),
      ],
    },
  })
}

// Cart

const retrieveCart = async (cartId: string) => {
  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: UCP_CART_FIELDS,
    })
    return cart
  } catch {
    return null
  }
}

const isCanceled = (cart: HttpTypes.StoreCart) =>
  cart.metadata?.[CANCELED_KEY] === true

const retrieveOpenCart = async (cartId: string) => {
  const cart = await retrieveCart(cartId)
  return cart && !cart.completed_at && !isCanceled(cart) ? cart : null
}

const syncLineItems = async (
  cart: HttpTypes.StoreCart,
  items: { variant_id: string; quantity: number }[]
) => {
  const desired = new Map(items.map((item) => [item.variant_id, item.quantity]))
  const existing = new Map(
    (cart.items ?? []).map((line) => [line.variant_id, line])
  )

  for (const [variantId, line] of Array.from(existing)) {
    const quantity = variantId ? desired.get(variantId) : undefined
    if (quantity === undefined) {
      await sdk.store.cart.deleteLineItem(cart.id, line.id)
    } else if (quantity !== line.quantity) {
      await sdk.store.cart.updateLineItem(cart.id, line.id, { quantity })
    }
  }
  for (const [variantId, quantity] of Array.from(desired)) {
    if (!existing.has(variantId)) {
      await sdk.store.cart.createLineItem(cart.id, {
        variant_id: variantId,
        quantity,
      })
    }
  }
}

const toUcpCartBody = (request: Request, cart: HttpTypes.StoreCart) => ({
  id: cart.id,
  currency: cart.currency_code.toUpperCase(),
  line_items: toUcpLineItems(cart),
  totals: toUcpTotals(cart),
  continue_url: cartContinueUrl(getRequestOrigin(request), cart),
  messages: [],
})

const cartNotFound = () => ucpError(CART, 200, "not_found", "Cart not found")

export const createCart = async (
  request: Request,
  input: Input,
  idempotencyKey?: string | null
): Promise<UcpResult> => {
  const items = parseLineItems(input.line_items ?? [])
  if (!items) return invalidLineItems(CART)

  const resolved = await resolveRegion(contextCountry(input))
  if (!resolved) return unsupportedCountry(CART)

  let cartId: string
  try {
    cartId = await withIdempotency(idempotencyKey, "cart", () =>
      createCartWithItems(resolved.region.id, items)
    )
  } catch {
    return itemUnavailable(CART)
  }

  const cart = await retrieveCart(cartId)
  return cart
    ? ucpResult(CART, toUcpCartBody(request, cart), 201)
    : cartNotFound()
}

export const getCart = async (
  request: Request,
  cartId: string
): Promise<UcpResult> => {
  const cart = await retrieveOpenCart(cartId)
  return cart ? ucpResult(CART, toUcpCartBody(request, cart)) : cartNotFound()
}

export const updateCart = async (
  request: Request,
  cartId: string,
  input: Input
): Promise<UcpResult> => {
  const items = parseLineItems(input.line_items)
  if (!items) return invalidLineItems(CART)

  const cart = await retrieveOpenCart(cartId)
  if (!cart) return cartNotFound()

  try {
    await syncLineItems(cart, items)
  } catch {
    return itemUnavailable(CART)
  }

  const updated = await retrieveCart(cart.id)
  return updated
    ? ucpResult(CART, toUcpCartBody(request, updated))
    : cartNotFound()
}

export const cancelCart = async (
  request: Request,
  cartId: string
): Promise<UcpResult> => {
  const cart = await retrieveOpenCart(cartId)
  if (!cart) return cartNotFound()

  await sdk.store.cart.update(cart.id, {
    metadata: { ...cart.metadata, [CANCELED_KEY]: true },
  })
  return ucpResult(CART, {
    ...toUcpCartBody(request, cart),
    continue_url: undefined,
    messages: [{ type: "info", code: "canceled", content: "Cart canceled" }],
  })
}

// Checkout

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const firstItem = (value: unknown) =>
  asObject(Array.isArray(value) ? value[0] : undefined)

const firstDestination = (input: Input) =>
  firstItem(firstItem(asObject(input.fulfillment).methods).destinations)

const applyCheckoutDetails = async (
  cart: HttpTypes.StoreCart,
  input: Input
): Promise<UcpResult | null> => {
  const buyer = asObject(input.buyer)
  const destination = firstDestination(input)

  const update: HttpTypes.StoreUpdateCart = {}

  const email = asString(buyer.email)
  if (email) {
    if (!EMAIL_PATTERN.test(email)) {
      return ucpError(
        CHECKOUT,
        400,
        "invalid_email",
        "buyer.email is not a valid email address"
      )
    }
    update.email = email
  }

  const countryCode = asString(destination.address_country)?.toLowerCase()
  if (countryCode) {
    const inCartRegion = cart.region?.countries?.some(
      (c) => c.iso_2 === countryCode
    )
    if (!inCartRegion) {
      const regions = await listRegions()
      const region = regions.find((r) =>
        r.countries?.some((c) => c.iso_2 === countryCode)
      )
      if (!region) return unsupportedCountry(CHECKOUT)
      update.region_id = region.id
    }

    update.shipping_address = {
      first_name:
        asString(destination.first_name) ?? asString(buyer.first_name),
      last_name: asString(destination.last_name) ?? asString(buyer.last_name),
      address_1: asString(destination.street_address),
      address_2: asString(destination.extended_address),
      city: asString(destination.address_locality),
      province: asString(destination.address_region),
      postal_code: asString(destination.postal_code),
      phone: asString(destination.phone_number) ?? asString(buyer.phone_number),
      country_code: countryCode,
    }
  }

  if (Object.keys(update).length) {
    await sdk.store.cart.update(cart.id, update)
  }
  return null
}

// Only call for carts with `completed_at` set: completing an already-completed
// cart returns its existing order (the Store API cart route doesn't expose it).
const findOrder = async (cartId: string) => {
  try {
    const result = await sdk.store.cart.complete(cartId, {
      fields: "id,display_id",
    })
    return result.type === "order" ? result.order : null
  } catch {
    return null
  }
}

const toUcpCheckoutBody = async (
  request: Request,
  cart: HttpTypes.StoreCart
) => {
  const origin = getRequestOrigin(request)
  const countryCode = cartCountryCode(cart)
  const base = `${origin}/${countryCode}`
  const address = cart.shipping_address

  const missing = [
    !cart.email && {
      path: "$.buyer.email",
      content: "Buyer email is required",
    },
    !address?.address_1 && {
      path: "$.fulfillment.methods[0].destinations[0]",
      content: "A shipping destination is required",
    },
  ].filter(Boolean) as { path: string; content: string }[]

  const order = cart.completed_at ? await findOrder(cart.id) : null
  const status = isCanceled(cart)
    ? "canceled"
    : order
    ? "completed"
    : missing.length
    ? "incomplete"
    : "requires_escalation"
  const isOpen = status === "incomplete" || status === "requires_escalation"

  return {
    id: cart.id,
    status,
    currency: cart.currency_code.toUpperCase(),
    line_items: toUcpLineItems(cart),
    totals: toUcpTotals(cart),
    buyer: cart.email ? { email: cart.email } : undefined,
    fulfillment: address?.address_1
      ? {
          methods: [
            {
              type: "shipping",
              destinations: [
                {
                  first_name: address.first_name ?? undefined,
                  last_name: address.last_name ?? undefined,
                  street_address: address.address_1,
                  extended_address: address.address_2 ?? undefined,
                  address_locality: address.city ?? undefined,
                  address_region: address.province ?? undefined,
                  postal_code: address.postal_code ?? undefined,
                  address_country: address.country_code?.toUpperCase(),
                },
              ],
            },
          ],
        }
      : undefined,
    links: [
      { type: "terms_of_service", url: `${base}/terms` },
      { type: "privacy_policy", url: `${base}/privacy` },
      { type: "refund_policy", url: `${base}/returns` },
      { type: "shipping_policy", url: `${base}/shipping` },
    ],
    order: order
      ? { id: order.id, permalink_url: `${base}/order/${order.id}/confirmed` }
      : undefined,
    continue_url: isOpen ? cartContinueUrl(origin, cart) : undefined,
    messages: isOpen
      ? [
          ...missing.map(({ path, content }) => ({
            type: "error",
            code: "missing",
            path,
            content,
            severity: "recoverable",
          })),
          {
            type: "error",
            code: "payment_required",
            content:
              "This store doesn't accept payment through the API. The buyer selects delivery and pays at continue_url.",
            severity: "requires_buyer_input",
          },
        ]
      : [],
  }
}

const checkoutNotFound = () =>
  ucpError(CHECKOUT, 200, "not_found", "Checkout session not found")

export const createCheckout = async (
  request: Request,
  input: Input,
  idempotencyKey?: string | null
): Promise<UcpResult> => {
  const destinationCountry = asString(firstDestination(input).address_country)

  let cartId = asString(input.cart_id)
  if (cartId) {
    if (!(await retrieveOpenCart(cartId))) {
      return ucpError(CHECKOUT, 200, "not_found", "Cart not found")
    }
  } else {
    const items = parseLineItems(input.line_items)
    if (!items?.length) return invalidLineItems(CHECKOUT)

    const resolved = await resolveRegion(
      destinationCountry ?? contextCountry(input)
    )
    if (!resolved) return unsupportedCountry(CHECKOUT)

    try {
      cartId = await withIdempotency(idempotencyKey, "checkout", () =>
        createCartWithItems(resolved.region.id, items)
      )
    } catch {
      return itemUnavailable(CHECKOUT)
    }
  }

  const cart = await retrieveOpenCart(cartId)
  if (!cart) return checkoutNotFound()

  const error = await applyCheckoutDetails(cart, input)
  if (error) return error

  const updated = await retrieveCart(cart.id)
  return updated
    ? ucpResult(CHECKOUT, await toUcpCheckoutBody(request, updated), 201)
    : checkoutNotFound()
}

export const getCheckout = async (
  request: Request,
  id: string
): Promise<UcpResult> => {
  const cart = await retrieveCart(id)
  return cart
    ? ucpResult(CHECKOUT, await toUcpCheckoutBody(request, cart))
    : checkoutNotFound()
}

export const updateCheckout = async (
  request: Request,
  id: string,
  input: Input
): Promise<UcpResult> => {
  const cart = await retrieveOpenCart(id)
  if (!cart) return checkoutNotFound()

  if (input.line_items !== undefined) {
    const items = parseLineItems(input.line_items)
    if (!items?.length) return invalidLineItems(CHECKOUT)
    try {
      await syncLineItems(cart, items)
    } catch {
      return itemUnavailable(CHECKOUT)
    }
  }

  const error = await applyCheckoutDetails(cart, input)
  if (error) return error

  const updated = await retrieveCart(cart.id)
  return updated
    ? ucpResult(CHECKOUT, await toUcpCheckoutBody(request, updated))
    : checkoutNotFound()
}

/**
 * Payment can't be taken through the API, so completing an open session
 * returns it unchanged with `requires_escalation` and a `continue_url`.
 */
export const completeCheckout = (request: Request, id: string) =>
  getCheckout(request, id)

export const cancelCheckout = async (
  request: Request,
  id: string
): Promise<UcpResult> => {
  const cart = await retrieveCart(id)
  if (!cart) return checkoutNotFound()
  if (cart.completed_at) {
    return ucpError(
      CHECKOUT,
      409,
      "already_completed",
      "This checkout has already been completed"
    )
  }

  if (!isCanceled(cart)) {
    await sdk.store.cart.update(cart.id, {
      metadata: { ...cart.metadata, [CANCELED_KEY]: true },
    })
  }
  const updated = await retrieveCart(cart.id)
  return updated
    ? ucpResult(CHECKOUT, await toUcpCheckoutBody(request, updated))
    : checkoutNotFound()
}
