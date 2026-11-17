import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { createShokzMediaImporter } from "./shokz-media"

export async function publishShokzContent(
  importMedia: Awaited<ReturnType<typeof createShokzMediaImporter>>
) {
  const sourceDirectory = path.resolve(process.cwd(), "data/content")
  const storefrontDirectory = path.resolve(process.cwd(), "../storefront/src")
  for (const name of ["home", "pages", "articles", "branding"]) {
    const source = JSON.parse(await readFile(path.join(sourceDirectory, `${name}.json`), "utf8"))
    const content = await importMedia(source)
    await writeFile(
      path.join(storefrontDirectory, "content", `${name}.json`),
      JSON.stringify(content, null, 2) + "\n"
    )
  }
}
