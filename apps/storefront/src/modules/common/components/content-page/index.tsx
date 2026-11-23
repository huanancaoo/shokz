import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import Image from "@modules/common/components/store-image"
import Link from "next/link"
import { Button } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import { Label } from "@modules/common/components/ui/label"
import { Textarea } from "@modules/common/components/ui/textarea"
import ProductPreview from "@modules/products/components/product-preview"
import CmsRichText from "@modules/common/components/cms-rich-text"
import { listReferencedProducts } from "@lib/data/cms"
import { cmsMediaURL } from "@/cms/media-url"
import { relationID } from "@/cms/content-model"
import type { Page, Post } from "@/payload-types"
import PageBlocks, { PageHero } from "./page-blocks"

export default async function Editorial({
  page,
  countryCode,
  preview = false,
}: {
  page: Page | Post
  countryCode: string
  preview?: boolean
}) {
  const isPage = "kind" in page
  const kind = isPage ? page.kind : "article"
  const display = ["display", "membership"].includes(kind)
  const photos = (isPage ? [] : page.photos ?? [])
    .map(cmsMediaURL)
    .filter((url): url is string => Boolean(url))
  const productIDs = (page.products ?? [])
    .map(relationID)
    .filter((id): id is string => typeof id === "string")
  const products = await listReferencedProducts(countryCode, productIDs)
  return (
    <article>
      {isPage ? <PageHero page={page} countryCode={countryCode} /> : (
        <header className="editorial-hero">
          <div className="content-container">
            <p className="eyebrow">SHOKZ · JOURNAL</p>
            <h1>{page.title}</h1>
          </div>
        </header>
      )}
      <div className="editorial-body content-container">
        {display && (
          <p className="display-notice mb-8">
            브랜드 서비스 소개를 위한 POC 전시 화면입니다. 포인트 지급, 서비스
            신청 및 개인정보 수집은 진행되지 않습니다.
          </p>
        )}
        {isPage ? (
          <PageBlocks page={page} countryCode={countryCode} preview={preview} />
        ) : (
          <>
            {photos[0] && (
              <Image
                className="editorial-main-image"
                src={photos[0]}
                alt={page.title}
                width={1200}
                height={700}
                priority
              />
            )}
            <div className="editorial-paragraphs">
              <CmsRichText data={page.body} countryCode={countryCode} />
            </div>
            {photos.length > 1 && (
              <div className="editorial-gallery">
                {photos.slice(1).map((image, index) => (
                  <Image
                    key={`${image}-${index}`}
                    src={image}
                    alt={page.title}
                    width={800}
                    height={650}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </>
        )}
        {products.length > 0 && (
          <section className="mt-12" aria-labelledby="editorial-products">
            <h2 id="editorial-products" className="mb-5 text-xl font-semibold">
              관련 제품
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products.map((product) => (
                <ProductPreview key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
        {["registration", "business", "support"].includes(page.slug) && (
          <section className="display-form">
            <h2>{page.slug === "registration" ? "정품 등록" : "문의하기"}</h2>
            <Label>
              이름
              <Input disabled placeholder="이름을 입력해 주세요" />
            </Label>
            <Label>
              이메일
              <Input disabled type="email" placeholder="이메일 주소" />
            </Label>
            {page.slug === "registration" ? (
              <Label>
                제품 시리얼 번호
                <Input disabled placeholder="제품 시리얼 번호" />
              </Label>
            ) : (
              <Label>
                문의 내용
                <Textarea
                  disabled
                  placeholder="문의 내용을 입력해 주세요"
                  rows={4}
                />
              </Label>
            )}
            <Button size="lg" className="shokz-button" disabled>
              전시용 양식 · 제출할 수 없습니다
            </Button>
          </section>
        )}
        <div className="mt-12">
          <Link href={`/${countryCode}/store`} className="text-link">
            샥즈 제품 만나보기 <HugeiconsIcon icon={ArrowRight01Icon} />
          </Link>
        </div>
      </div>
    </article>
  )
}
