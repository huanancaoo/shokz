import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow, createCustomerAccountWorkflow, createInventoryLevelsWorkflow, createLinksWorkflow,
  createLocationFulfillmentSetWorkflow, createProductCategoriesWorkflow,
  createProductsWorkflow, updateProductsWorkflow, updateProductVariantsWorkflow, createProductTagsWorkflow, createRegionsWorkflow,
  createSalesChannelsWorkflow, createServiceZonesWorkflow, createShippingOptionsWorkflow, createStockLocationsWorkflow,
  createStoresWorkflow, createTaxRegionsWorkflow, linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow, updateRegionsWorkflow, updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

type SourceVariant = {
  title: string; sku: string; price: number; inventory_quantity: number
  options: Record<string, string>; images: string[]; video?: string | null
}
type SourceProduct = {
  handle: string; title: string; subtitle: string; description: string; category: string
  thumbnail: string; images: string[]; options: { title: string; values: string[] }[]
  variants: SourceVariant[]; metadata: Record<string, unknown> & { features: string[] }
}
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies"
import { createShokzMediaImporter } from "../lib/shokz-media"
import { publishShokzContent } from "../lib/shokz-content"

type Catalog = { categories: { name: string; handle: string }[]; products: SourceProduct[] }

export default async function seedShokz({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const importMedia = await createShokzMediaImporter(container)
  const catalog = await importMedia<Catalog>(JSON.parse(await readFile(path.resolve(process.cwd(), "data/catalog.json"), "utf8")))
  await publishShokzContent(importMedia)
  const { data: channels } = await query.graph({ entity: "sales_channel", fields: ["id"], filters: { name: "Shokz Korea POC" } })
  const channel = channels[0] ?? (await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: "Shokz Korea POC" }] } })).result[0]
  const { data: stores } = await query.graph({ entity: "store", fields: ["id"] })
  const storeData = { name: "Shokz Korea", supported_currencies: [{ currency_code: "krw", is_default: true }], default_sales_channel_id: channel.id }
  if (stores[0]) {
    await updateStoresWorkflow(container).run({ input: { selector: { id: stores[0].id }, update: storeData } })
  } else {
    await createStoresWorkflow(container).run({ input: { stores: [storeData] } })
  }
  const { data: keys } = await query.graph({ entity: "api_key", fields: ["id", "token"], filters: { title: "Shokz storefront" } })
  const key = keys[0] ?? (await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: "Shokz storefront", type: "publishable", created_by: "" }] } })).result[0]
  await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: key.id, add: [channel.id] } })
  const providers = ["pp_system_default"]
  const { data: regions } = await query.graph({ entity: "region", fields: ["id"], filters: { name: "대한민국" } })
  const regionData = { name: "대한민국", currency_code: "krw", countries: ["kr"], automatic_taxes: false, payment_providers: providers, metadata: DEFAULT_REGION_STORE_POLICIES }
  const region = regions[0] ?? (await createRegionsWorkflow(container).run({ input: { regions: [regionData] } })).result[0]
  if (regions[0]) await updateRegionsWorkflow(container).run({ input: { selector: { id: region.id }, update: regionData } })
  const { data: taxRegions } = await query.graph({ entity: "tax_region", fields: ["id"], filters: { country_code: "kr" } })
  if (!taxRegions.length) await createTaxRegionsWorkflow(container).run({ input: [{ country_code: "kr", provider_id: "tp_system", default_tax_rate: { name: "POC", rate: 0, code: "POC" } }] })
  const { data: locations } = await query.graph({ entity: "stock_location", fields: ["id"], filters: { name: "Shokz POC Warehouse" } })
  const location = locations[0] ?? (await createStockLocationsWorkflow(container).run({ input: { locations: [{ name: "Shokz POC Warehouse", address: { city: "서울", country_code: "KR", address_1: "POC" } }] } })).result[0]
  if (!locations.length) await createLinksWorkflow(container).run({ input: [{ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" } }] })
  await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } })
  let { data: sets } = await query.graph({ entity: "fulfillment_set", fields: ["id", "service_zones.id"], filters: { name: "Shokz Korea delivery" } })
  if (!sets.length) {
    await createLocationFulfillmentSetWorkflow(container).run({ input: { location_id: location.id, fulfillment_set_data: { name: "Shokz Korea delivery", type: "shipping" } } })
    sets = (await query.graph({ entity: "fulfillment_set", fields: ["id", "service_zones.id"], filters: { name: "Shokz Korea delivery" } })).data
  }
  if (!sets[0].service_zones.length) {
    await createServiceZonesWorkflow(container).run({ input: { data: [{ name: "대한민국", fulfillment_set_id: sets[0].id, geo_zones: [{ country_code: "kr", type: "country" }] }] } })
    sets = (await query.graph({ entity: "fulfillment_set", fields: ["id", "service_zones.id"], filters: { name: "Shokz Korea delivery" } })).data
  }
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  const { data: shipping } = await query.graph({ entity: "shipping_option", fields: ["id"], filters: { name: "한국 표준 배송" } })
  if (!shipping.length) await createShippingOptionsWorkflow(container).run({ input: [{ name: "한국 표준 배송", price_type: "flat", provider_id: "manual_manual", service_zone_id: sets[0].service_zones[0].id, shipping_profile_id: profiles[0].id, type: { label: "표준 배송", description: "POC 배송", code: "standard" }, prices: [{ currency_code: "krw", amount: 0 }, { region_id: region.id, amount: 0 }], rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" }, { attribute: "is_return", value: "false", operator: "eq" }] }] })
  const { data: existingCategories } = await query.graph({ entity: "product_category", fields: ["id", "handle"] })
  const categories: { id: string; handle: string }[] = [...existingCategories]
  const missingCategories = catalog.categories.filter((c) => !categories.some((e) => e.handle === c.handle))
  if (missingCategories.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({ input: { product_categories: missingCategories.map((c) => ({ ...c, is_active: true, is_internal: false })) } })
    categories.push(...result)
  }
  const { data: existingTags } = await query.graph({ entity: "product_tag", fields: ["id", "value"] })
  const tags: { id: string; value: string }[] = [...existingTags]
  const tagNames = [...new Set(catalog.products.flatMap((p) => p.metadata.features))]
  const missingTags = tagNames.filter((name) => !tags.some((tag) => tag.value === name))
  if (missingTags.length) {
    const { result } = await createProductTagsWorkflow(container).run({ input: { product_tags: missingTags.map((value) => ({ value })) } })
    tags.push(...result)
  }
    const { data: existingProducts } = await query.graph({ entity: "product", fields: ["id", "handle", "variants.id", "variants.sku", "variants.metadata"] })
  for (const product of catalog.products) {
    const existing = existingProducts.find((item) => item.handle === product.handle)
    if (existing) {
      // 刷新采集内容时保留后台管理的价格、SKU、库存和已经产生的订单关系。
      await updateProductsWorkflow(container).run({ input: { products: [{ id: existing.id, description: product.description, metadata: product.metadata }] } })
        await updateProductVariantsWorkflow(container).run({ input: { product_variants: product.variants.map((variant) => {
          const saved = existing.variants.find((item) => item.sku === variant.sku)!
          return { id: saved.id, title: variant.title, metadata: { ...saved.metadata, gallery: variant.images, gallery_video: variant.video } }
        }) } })
      continue
    }
    await createProductsWorkflow(container).run({ input: { products: [{
      title: product.title, subtitle: product.subtitle, handle: product.handle,
      description: product.description, thumbnail: product.thumbnail,
      images: product.images.map((url) => ({ url })),
      options: product.options.length ? product.options : [{ title: "모델", values: [product.title] }],
      status: ProductStatus.PUBLISHED,
      category_ids: [categories.find((category) => category.handle === product.category)!.id],
      tag_ids: tags.filter((tag) => product.metadata.features.includes(tag.value)).map((tag) => tag.id),
      shipping_profile_id: profiles[0].id, sales_channels: [{ id: channel.id }], metadata: product.metadata,
      variants: product.variants.map((variant) => ({
        title: variant.title, sku: variant.sku, manage_inventory: true, allow_backorder: false,
        options: product.options.length ? variant.options : { 모델: product.title },
          prices: [{ currency_code: "krw", amount: variant.price }], metadata: { gallery: variant.images, gallery_video: variant.video },
      })),
    }] } })
  }
  const { data: inventory } = await query.graph({ entity: "inventory_item", fields: ["id", "sku", "location_levels.location_id"] })
  const stock = new Map(catalog.products.flatMap((p) => p.variants.map((v) => [v.sku, v.inventory_quantity] as const)))
  const missingStock = inventory.filter((item) => item.sku && stock.has(item.sku) && !item.location_levels?.some((level) => level?.location_id === location.id))
  if (missingStock.length) await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: missingStock.map((item) => ({ inventory_item_id: item.id, location_id: location.id, stocked_quantity: stock.get(item.sku!)! })) } })
  // Initialization binds the storefront to this sales channel's publishable key.
  const envPath = path.resolve(process.cwd(), "../storefront/.env.local")
  const env = await readFile(envPath, "utf8")
  await writeFile(envPath, env.replace(/^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`), { mode: 0o600 })
  const { data: demoCustomers } = await query.graph({
    entity: "customer",
    fields: ["id"],
    filters: { email: "demo@shokz.local", has_account: true },
  })
  if (!demoCustomers.length) {
    const auth = container.resolve(Modules.AUTH)
    const { authIdentity, error } = await auth.register("emailpass", {
      body: { email: "demo@shokz.local", password: "ShokzPoc2026!" },
    })
    if (error || !authIdentity) throw new Error(error)
    await createCustomerAccountWorkflow(container).run({
      input: {
        authIdentityId: authIdentity.id,
        customerData: {
          email: "demo@shokz.local",
          first_name: "POC",
          last_name: "테스트",
          phone: "01000000000",
          addresses: [{
            address_name: "POC 테스트 배송지",
            first_name: "POC",
            last_name: "테스트",
            address_1: "테스트 주소 1",
            city: "서울",
            province: "서울",
            postal_code: "05050",
            country_code: "kr",
            phone: "01000000000",
            is_default_shipping: true,
            is_default_billing: true,
          }],
        },
      },
    })
  }
  const { data: demoAdmins } = await query.graph({ entity: "user", fields: ["id"], filters: { email: "admin@shokz.local" } })
  if (!demoAdmins.length) logger.info("SHOKZ_DEMO_ADMIN_MISSING")
  logger.info(`Shokz POC: ${catalog.products.length} products and Korean region ready.`)
}
