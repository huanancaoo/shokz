import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import { Label } from "@modules/common/components/ui/label"
import { Textarea } from "@modules/common/components/ui/textarea"

export type EditorialPage = {
  slug: string
  title: string
  source_url: string
  kind: string
  images: string[]
  paragraphs: string[]
}

export default function Editorial({ page }: { page: EditorialPage }) {
  const display = ["display", "membership"].includes(page.kind)
  return (
    <article>
      <header className="editorial-hero">
        <div className="content-container">
          <p className="eyebrow">
            SHOKZ · {page.kind === "article" ? "JOURNAL" : "OPEN YOUR WORLD"}
          </p>
          <h1>{page.title}</h1>
        </div>
      </header>
      <div className="editorial-body content-container">
        {display && (
          <p className="display-notice mb-8">
            브랜드 서비스 소개를 위한 POC 전시 화면입니다. 포인트 지급, 서비스
            신청 및 개인정보 수집은 진행되지 않습니다.
          </p>
        )}
        {page.images[0] && (
          <Image
            className="editorial-main-image"
            src={page.images[0]}
            alt={page.title}
            width={1200}
            height={700}
            priority
          />
        )}
        <div className="editorial-paragraphs">
          {page.paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
        {page.images.length > 1 && (
          <div className="editorial-gallery">
            {page.images.slice(1).map((image) => (
              <Image
                key={image}
                src={image}
                alt={page.title}
                width={800}
                height={650}
                loading="lazy"
              />
            ))}
          </div>
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
          <LocalizedClientLink href="/store" className="text-link">
            샥즈 제품 만나보기 <HugeiconsIcon icon={ArrowRight01Icon} />
          </LocalizedClientLink>
        </div>
      </div>
    </article>
  )
}
