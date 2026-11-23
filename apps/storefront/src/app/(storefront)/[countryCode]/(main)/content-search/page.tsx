import type { Metadata } from "next"
import Link from "next/link"
import { searchCmsContent } from "@lib/data/cms"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"

export const metadata: Metadata = {
  title: "콘텐츠 검색 | SHOKZ Korea",
  robots: { index: false, follow: true },
}

export default async function ContentSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>
}) {
  const [{ countryCode }, filters] = await Promise.all([params, searchParams])
  const query = typeof filters.q === "string" ? filters.q.trim().slice(0, 120) : ""
  const pageNumber = Number(filters.page)
  const page = Number.isSafeInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1
  const basePath = `/${countryCode}/content-search`
  const results = query ? await searchCmsContent(query, page) : undefined
  const pageURL = (nextPage: number) => `${basePath}?${new URLSearchParams({
    q: query,
    page: String(nextPage),
  })}`

  return (
    <main className="content-container mx-auto py-14 sm:py-20">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">콘텐츠 검색</h1>
      <p className="mb-6 text-muted-foreground">샥즈의 소식과 페이지를 찾아보세요.</p>
      <form action={basePath} className="mb-10 flex max-w-2xl gap-2" role="search">
        <Input
          aria-label="콘텐츠 검색어"
          className="h-11"
          defaultValue={query}
          maxLength={120}
          name="q"
          placeholder="검색어를 입력하세요"
          type="search"
        />
        <Button size="lg" type="submit">검색</Button>
      </form>
      {results && (
        <section aria-label="검색 결과" className="max-w-3xl">
          {results.docs.length ? (
            <ul className="divide-y divide-border border-y border-border">
              {results.docs.map(({ id, href, title, type, description }) => (
                <li key={id}>
                  <Link href={`/${countryCode}${href}`} className="block py-5 hover:text-primary">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      {type === "posts" ? "블로그" : "페이지"}
                    </span>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          )}
          {(results.hasPrevPage || results.hasNextPage) && (
            <nav aria-label="검색 결과 페이지" className="mt-6 flex gap-2">
              {results.hasPrevPage && (
                <Link className={buttonVariants({ variant: "outline" })} href={pageURL(page - 1)}>이전</Link>
              )}
              {results.hasNextPage && (
                <Link className={buttonVariants({ variant: "outline" })} href={pageURL(page + 1)}>다음</Link>
              )}
            </nav>
          )}
        </section>
      )}
    </main>
  )
}
