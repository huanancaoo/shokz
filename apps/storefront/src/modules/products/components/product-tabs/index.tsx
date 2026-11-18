"use client"

import { useState } from "react"
import Image from "@modules/common/components/store-image"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PlayIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@modules/common/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@modules/common/components/ui/accordion"
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@modules/common/components/ui/table"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCompare } from "@lib/context/compare-context"
import { productMetadata, type ProductStoryBlock } from "@lib/util/product"

function StoryMedia({
  block,
  productTitle,
  continuous,
}: {
  block: ProductStoryBlock
  productTitle: string
  continuous: boolean
}) {
  const [active, setActive] = useState(0)
  if (continuous)
    return (
      <div className="story-media story-continuous">
        {block.media.map((media, index) => (
          <Image
            key={media.src}
            src={media.src}
            alt={productTitle + " 상세 설명 " + (index + 1)}
            width={media.width}
            height={media.height}
            sizes="(max-width: 767px) 100vw, 1200px"
            loading="lazy"
          />
        ))}
      </div>
    )
  const media = block.media[active]
  if (!media) return null
  const composite =
    active === 0 &&
    block.media.length === 2 &&
    media.width / media.height > 1.5 &&
    block.media[1].width / block.media[1].height < 1.3
  return (
    <div className={"story-media " + (composite ? "story-composite" : "")}>
      <Image
        src={media.src}
        alt={block.title || productTitle}
        width={media.width}
        height={media.height}
        sizes="(max-width: 767px) 100vw, 90vw"
        loading="lazy"
      />
      {composite && (
        <Image
          src={block.media[1].src}
          alt={productTitle + " 제품 렌더"}
          width={block.media[1].width}
          height={block.media[1].height}
          className="story-product-overlay"
          loading="lazy"
        />
      )}
      {block.media.length > (composite ? 2 : 1) && (
        <div className="story-media-controls">
          <span>
            {String(active + 1).padStart(2, "0")}{" "}
            <span>/ {String(block.media.length).padStart(2, "0")}</span>
          </span>
          <div>
            <Button
              variant="outline"
              size="icon"
              aria-label="이전 제품 설명 이미지"
              onClick={() =>
                setActive(
                  (active - 1 + block.media.length) % block.media.length
                )
              }
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="다음 제품 설명 이미지"
              onClick={() => setActive((active + 1) % block.media.length)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductStory({
  blocks,
  productTitle,
}: {
  blocks: ProductStoryBlock[]
  productTitle: string
}) {
  return (
    <div className="product-story">
      {blocks.length > 2 && (
        <nav
          className="story-jump-grid content-container"
          aria-label="제품 핵심 기능"
        >
          {blocks
            .filter((block) => block.title)
            .slice(0, 6)
            .map((block, index) => (
              <a href={"#" + block.id} key={block.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{block.title}</strong>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </a>
            ))}
        </nav>
      )}
      {blocks.map((block, index) => (
        <section
          key={block.id}
          id={block.id}
          className={"product-story-section " + (index % 2 ? "story-soft" : "")}
        >
          <div className="story-section-copy content-container">
            <span className="eyebrow">
              {productTitle} / {String(index + 1).padStart(2, "0")}
            </span>
            {block.title && <h2>{block.title}</h2>}
            {block.paragraphs.slice(0, 3).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {block.paragraphs.length > 3 && (
              <Accordion>
                <AccordionItem value="details">
                  <AccordionTrigger>기능 설명 자세히 보기</AccordionTrigger>
                  <AccordionContent>
                    {block.paragraphs.slice(3).map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
          {block.videos.length ? (
            <div className="story-video-wrap content-container">
              {block.videos.map((video) => (
                <video
                  key={video}
                  controls
                  playsInline
                  preload="none"
                  poster={block.media[0]?.src}
                  aria-label={block.title || productTitle + " 소개 영상"}
                >
                  <source src={video} type="video/mp4" />
                </video>
              ))}
              <p>
                <HugeiconsIcon icon={PlayIcon} size={15} />
                제품 영상을 재생해 보세요.
              </p>
            </div>
          ) : (
            <StoryMedia
              block={block}
              productTitle={productTitle}
              continuous={blocks.length === 1}
            />
          )}
        </section>
      ))}
    </div>
  )
}

export default function ProductTabs({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { handles } = useCompare()
  const data = productMetadata(product)
  const specs = Object.entries(data?.specifications ?? {})
  const faq = data?.faq ?? []
  const story = data?.story ?? []
  return (
    <>
      <nav className="product-content-nav" aria-label="제품 상세 내용">
        <a href="#overview">제품 소개</a>
        {specs.length > 0 && <a href="#specifications">제품 사양</a>}
        {faq.length > 0 && <a href="#faq">FAQ</a>}
        <a href="#reviews">리뷰</a>
        {handles.length > 0 && (
          <LocalizedClientLink href={"/compare?products=" + handles.join(",")}>
            비교 ({handles.length})
          </LocalizedClientLink>
        )}
        <a href="#purchase" className="product-nav-buy">
          구매하기
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </a>
      </nav>
      <div id="overview">
        {story.length > 0 && (
          <ProductStory blocks={story} productTitle={product.title} />
        )}
      </div>
      <div className="product-long-content content-container">
        {specs.length > 0 && (
          <section id="specifications">
            <div className="section-heading">
              <div>
                <p className="eyebrow">EVERY DETAIL MATTERS</p>
                <h2>제품 사양</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {product.title}
              </span>
            </div>
            <Table className="spec-table">
              <TableBody>
                {specs.slice(0, 8).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableHead scope="row">{key}</TableHead>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {specs.length > 8 && (
              <Accordion>
                <AccordionItem value="all-specifications">
                  <AccordionTrigger>
                    모든 사양 보기 ({specs.length}개)
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table className="spec-table">
                      <TableBody>
                        {specs.slice(8).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableHead scope="row">{key}</TableHead>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </section>
        )}
        {faq.length > 0 && (
          <section id="faq">
            <p className="eyebrow">GOOD TO KNOW</p>
            <h2>자주 묻는 질문</h2>
            <Accordion>
              {faq.map((item, index) => (
                <AccordionItem value={String(index)} key={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <LocalizedClientLink href="/pages/faq" className="text-link mt-6">
              더 많은 질문 보기
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </LocalizedClientLink>
          </section>
        )}
        <section id="reviews">
          <p className="eyebrow">THE SHOKZ COMMUNITY</p>
          <h2>사용자 리뷰</h2>
          {data?.rating?.avg && (
            <div className="reviews-summary">
              <strong>{data.rating.avg}</strong>
              <div>
                <div className="reviews-stars" aria-label="5점 만점">
                  {Array.from({ length: 5 }, (_, index) => (
                    <HugeiconsIcon icon={StarIcon} size={20} key={index} />
                  ))}
                </div>
                <p>
                  {data.rating.count?.toLocaleString("ko-KR")}개 리뷰 · 공식몰
                  스냅샷
                </p>
              </div>
            </div>
          )}
          <p className="display-notice">
            원본 공식몰의 리뷰 정보를 소개하는 POC 전시 화면입니다. 이
            사이트에서는 리뷰를 수집하지 않습니다.
          </p>
          <LocalizedClientLink href="/pages/reviews" className="text-link mt-6">
            공식몰 사용 후기 소개
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </LocalizedClientLink>
        </section>
      </div>
    </>
  )
}
