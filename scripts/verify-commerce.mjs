import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const require = createRequire(
  new URL("../apps/storefront/package.json", import.meta.url)
)
const Medusa = require("@medusajs/js-sdk").default
const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
assert.ok(backendUrl, "NEXT_PUBLIC_MEDUSA_BACKEND_URL is required")

const createClient = () =>
  new Medusa({
    baseUrl: backendUrl,
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    debug: false,
    auth: { type: "jwt", jwtTokenStorageMethod: "memory" }
  })
const sdk = createClient()
const checks = []
const pass = (name) => {
  checks.push(name)
  console.log("通过：" + name)
}
const { regions } = await sdk.store.region.list()
const region = regions.find((item) =>
  item.countries.some((country) => country.iso_2 === "kr")
)
assert.equal(region.currency_code, "krw")
const { products, count } = await sdk.store.product.list({
  region_id: region.id,
  limit: 100,
  fields:
    "*variants.calculated_price,+variants.inventory_quantity,+variants.metadata,+metadata,*categories,*options.values"
})
assert.equal(count, 22)
assert.equal(products.flatMap((item) => item.variants).length, 47)
for (const product of products) {
  assert.ok(
    product.options.every((option) =>
      option.values.some((value) => value.value.trim())
    )
  )
  for (const variant of product.variants) {
    assert.ok(variant.calculated_price.calculated_amount > 0)
    assert.equal(variant.calculated_price.currency_code, "krw")
    assert.ok(variant.metadata.gallery.length > 0)
  }
  assert.equal(
    new Set(product.metadata.faq.map((item) => item.question)).size,
    product.metadata.faq.length
  )
}
pass(`${count} 款商品、47 个 SKU 由 Medusa 返回，KRW 有效且无空选项`)

const search = async (filters, pagination = {}) => {
  const { results } = await sdk.client.fetch("/store/search", {
    method: "POST",
    body: {
      entity: "product",
      fields: ["id", "title", "handle", "min_price_krw"],
      filters,
      pagination: { take: 100, ...pagination },
      search_options: { count: "exact" }
    }
  })
  return results[0]
}
assert.equal((await search({})).metadata.count, count)
assert.ok((await search({ q: "오픈런" })).hits.length > 0)
assert.equal((await search({ q: "없는상품POC987654" })).hits.length, 0)
const sorted = (
  await search(
    { min_price_krw: { $lte: 200000 } },
    { order: { min_price_krw: "ASC" } }
  )
).hits
const hitPrice = (hit) =>
  Math.min(
    ...products
      .find((item) => item.id === hit.id)
      .variants.map((item) => item.calculated_price.calculated_amount)
  )
assert.ok(sorted.every((item) => hitPrice(item) <= 200000))
assert.ok(
  sorted.every(
    (item, index) =>
      index === 0 || hitPrice(item) >= hitPrice(sorted[index - 1])
  )
)
pass("原生 Search：韩文搜索、无结果、价格过滤和排序")

const product = products.find((item) => item.handle === "openrun-pro2")
const variant = product.variants.find((item) => item.inventory_quantity > 2)
const accessory = products.find(
  (item) =>
    item.categories.some((category) => category.handle === "accessories") &&
    item.variants.some((option) => option.inventory_quantity > 0)
)
const accessoryVariant = accessory.variants.find(
  (item) => item.inventory_quantity > 0
)
const unitPrice = variant.calculated_price.calculated_amount
const email = `verification-${Date.now()}@shokz.local`
let { cart } = await sdk.store.cart.create({
  region_id: region.id,
  email,
  items: [{ variant_id: variant.id, quantity: 1 }]
})
assert.equal(cart.total, unitPrice)
cart = (
  await sdk.store.cart.updateLineItem(cart.id, cart.items[0].id, {
    quantity: 2
  })
).cart
assert.equal(cart.total, unitPrice * 2)
cart = (
  await sdk.store.cart.createLineItem(cart.id, {
    variant_id: accessoryVariant.id,
    quantity: 1
  })
).cart
const accessoryLine = cart.items.find(
  (item) => item.variant_id === accessoryVariant.id
)
await sdk.store.cart.deleteLineItem(cart.id, accessoryLine.id)
cart = (await sdk.store.cart.retrieve(cart.id)).cart
assert.equal(cart.total, unitPrice * 2)
cart = (
  await sdk.store.cart.updateLineItem(cart.id, cart.items[0].id, {
    quantity: 1
  })
).cart
pass("实际购物车：加入、修改数量、删除，金额随行项目一致变化")

const address = {
  first_name: "POC",
  last_name: "테스트",
  address_1: "테스트 주소 1",
  city: "서울",
  province: "서울",
  postal_code: "05050",
  country_code: "kr",
  phone: "01000000000"
}
cart = (
  await sdk.store.cart.update(cart.id, {
    shipping_address: address,
    billing_address: address
  })
).cart
const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
  cart_id: cart.id
})
const shipping = shipping_options.find((item) => item.name === "한국 표준 배송")
assert.ok(shipping)
cart = (
  await sdk.store.cart.addShippingMethod(cart.id, { option_id: shipping.id })
).cart
assert.equal(cart.shipping_total, 0)
assert.equal(cart.tax_total, 0)
assert.equal(cart.total, unitPrice)
const { payment_providers } = await sdk.store.payment.listPaymentProviders({
  region_id: region.id
})
assert.deepEqual(
  payment_providers.map((item) => item.id),
  ["pp_system_default"]
)
const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
  cart,
  { provider_id: "pp_system_default" }
)
assert.equal(payment_collection.amount, unitPrice)
assert.equal(payment_collection.currency_code, "krw")
assert.equal(payment_collection.payment_sessions[0].amount, unitPrice)
pass("韩国配送 0、税费 0、默认支付会话金额等于购物车 KRW 总额")

// 同一购物车并发完成，验证原生工作流的锁和幂等语义，不能产生两张订单。
const completions = await Promise.allSettled([
  sdk.store.cart.complete(cart.id),
  sdk.store.cart.complete(cart.id)
])
const orders = completions
  .filter(
    (result) => result.status === "fulfilled" && result.value.type === "order"
  )
  .map((result) => result.value.order)
assert.ok(orders.length > 0)
assert.equal(new Set(orders.map((order) => order.id)).size, 1)
const order = orders[0]
assert.equal(order.total, unitPrice)
assert.equal(order.currency_code, "krw")
const repeated = await sdk.store.cart
  .complete(cart.id)
  .catch((error) => ({ status: error.status }))
if (repeated.type === "order") assert.equal(repeated.order.id, order.id)
else
  assert.ok(
    [400, 409].includes(repeated.status),
    "重复完成必须返回原订单或明确拒绝"
  )
const admin = createClient()
await admin.auth.login("user", "emailpass", {
  email: "admin@shokz.local",
  password: "ShokzPoc2026!"
})
const adminOrders = (
  await admin.admin.order.list({
    limit: 100,
    order: "-created_at",
    fields: "+email"
  })
).orders.filter((item) => item.email === email)
assert.equal(adminOrders.length, 1)
assert.equal(adminOrders[0].id, order.id)
pass("游客下单、并发提交、重复提交：后台只生成一张订单")

let savedOrder = (
  await admin.admin.order.retrieve(order.id, {
    fields: "*payment_collections.payments"
  })
).order
assert.equal(savedOrder.payment_status, "authorized")
const payment = savedOrder.payment_collections.flatMap(
  (collection) => collection.payments
)[0]
await admin.admin.payment.capture(payment.id, { amount: unitPrice })
savedOrder = (await admin.admin.order.retrieve(order.id)).order
assert.equal(savedOrder.payment_status, "captured")
assert.equal(savedOrder.total, unitPrice)
pass("Medusa 默认支付：授权后通过原生后台 API 完成测试捕获，订单状态准确")

const customer = createClient()
await customer.auth.login("customer", "emailpass", {
  email: "demo@shokz.local",
  password: "ShokzPoc2026!"
})
const profile = (await customer.store.customer.retrieve()).customer
const memberVariant = products
  .find((item) => item.handle === "openmove")
  .variants.find((item) => item.inventory_quantity > 0)
let memberCart = (
  await customer.store.cart.create({
    region_id: region.id,
    email: profile.email,
    shipping_address: address,
    billing_address: address,
    items: [{ variant_id: memberVariant.id, quantity: 1 }]
  })
).cart
memberCart = (
  await customer.store.cart.addShippingMethod(memberCart.id, {
    option_id: shipping.id
  })
).cart
await customer.store.payment.initiatePaymentSession(memberCart, {
  provider_id: "pp_system_default"
})
const memberResult = await customer.store.cart.complete(memberCart.id, {
  fields: "+customer_id"
})
assert.equal(memberResult.type, "order")
assert.equal(memberResult.order.customer_id, profile.id)
const customerOrders = (
  await customer.store.order.list({ fields: "+customer_id" })
).orders
assert.ok(profile.addresses.length > 0)
assert.ok(
  customerOrders.some(
    (item) =>
      item.id === memberResult.order.id && item.customer_id === profile.id
  )
)
pass("注册客户登录、读取保存地址、下单及查询账户订单")

const report = {
  verified_at: new Date().toISOString(),
  backend: backendUrl,
  checks,
  test_order: {
    id: order.id,
    display_id: order.display_id,
    total: unitPrice,
    currency: "krw",
    payment_status: savedOrder.payment_status
  },
  duplicate_results: completions.map((result) =>
    result.status === "fulfilled" ? result.value.type : result.reason.status
  ),
  customer_order: {
    id: memberResult.order.id,
    total: memberResult.order.total,
    currency: memberResult.order.currency_code
  },
  excluded: "Stripe 已取消；3DS、拒付、外部支付 Webhook 不适用于默认支付。"
}
const directory = path.join(root, ".scratch/verification")
await fs.mkdir(directory, { recursive: true })
await fs.writeFile(
  path.join(directory, "commerce-report.json"),
  JSON.stringify(report, null, 2) + "\n"
)
console.log("验证记录已保存：.scratch/verification/commerce-report.json")
