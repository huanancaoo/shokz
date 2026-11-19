import { MedusaError } from "@medusajs/framework/utils"

type Options = { url: string; apiKey: string }

export type CatalogProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}

export default class PayloadCatalogService {
  private readonly collectionUrl: string
  private readonly authorization: string

  constructor(_container: unknown, { url, apiKey }: Options) {
    this.collectionUrl = new URL("/api/medusa-products", url).href
    this.authorization = `commerce-sync API-Key ${apiKey}`
  }

  private async request(
    url: string,
    { method, body, signal }: RequestInit,
    allowMissing = false
  ) {
    const timeout = AbortSignal.timeout(10_000)
    const response = await fetch(url, {
      method,
      body,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: {
        Authorization: this.authorization,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok && !(allowMissing && response.status === 404)) {
      await response.body?.cancel()
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Payload catalog ${method} returned HTTP ${response.status}`
      )
    }
    return response
  }

  async mirror(
    id: string,
    product: CatalogProduct | null,
    signal?: AbortSignal
  ) {
    const documentUrl = `${this.collectionUrl}/${encodeURIComponent(id)}`
    if (!product) {
      const response = await this.request(
        documentUrl,
        { method: "DELETE", signal },
        true
      )
      await response.body?.cancel()
      return
    }

    const { title, handle, thumbnail } = product
    const updated = await this.request(
      documentUrl,
      {
        method: "PATCH",
        body: JSON.stringify({ title, handle, thumbnail }),
        signal,
      },
      true
    )
    await updated.body?.cancel()
    if (updated.status === 404) {
      const created = await this.request(this.collectionUrl, {
        method: "POST",
        body: JSON.stringify(product),
        signal,
      })
      await created.body?.cancel()
    }
  }

  async listIds() {
    const ids: string[] = []
    const url = new URL(this.collectionUrl)
    url.searchParams.set("limit", "100")
    url.searchParams.set("sort", "id")
    url.searchParams.set("select[id]", "true")

    let page = 1
    for (;;) {
      url.searchParams.set("page", String(page))
      const response = await this.request(url.href, { method: "GET" })
      const { docs, nextPage } = (await response.json()) as {
        docs: { id: string }[]
        nextPage: number | null
      }
      ids.push(...docs.map(({ id }) => id))
      if (!nextPage) return ids
      page = nextPage
    }
  }
}
