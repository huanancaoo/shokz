import type { Metadata } from "next"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { listProducts } from "@lib/data/products"
import { buttonVariants } from "@modules/common/components/ui/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@modules/common/components/ui/tabs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Hero from "@modules/home/components/hero"
import FeaturedProducts from "@modules/home/components/featured-products"
import ProductFinder from "@modules/home/components/product-finder"
import home from "@/content/home.json"
import articles from "@/content/articles.json"

export const metadata: Metadata = {
  title: "SHOKZ Korea | 귀를 열고, 세상을 넓히다",
  description:
    "세상과 연결되는 샥즈 오픈이어 이어폰. 당신의 모든 움직임과 일상에 어울리는 사운드를 만나보세요.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 100, order: "created_at" },
  })
  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <section className="home-benefits content-container">
        <div className="benefits-heading">
          <p className="eyebrow">ONLY AT SHOKZ</p>
          <h2>
            공식몰에서 만나는
            <br />
            특별한 경험.
          </h2>
          <p>샥즈의 공식 브랜드 서비스를 만나보세요.</p>
          <small>멤버십 및 서비스 신청은 POC 전시용 안내입니다.</small>
        </div>
        <div className="benefits-rail">
          {home.benefits.map((benefit) => (
            <LocalizedClientLink
              href={benefit.href}
              key={benefit.id}
              className="benefit-card"
            >
              {benefit.image && (
                <Image
                  src={benefit.image}
                  alt=""
                  width={160}
                  height={160}
                  loading="lazy"
                />
              )}
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <span>
                자세히 보기
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
      <section className="home-awards content-container">
        <p className="eyebrow">RECOGNIZED AROUND THE WORLD</p>
        <h2>
          파트너십으로 만든 성과.
          <br />
          디자인으로 입증한 가치.
        </h2>
        <div>
          {home.awards.map((award) => (
            <Image
              src={award}
              alt="Shokz 파트너십 및 수상"
              key={award}
              width={180}
              height={95}
              loading="lazy"
            />
          ))}
        </div>
      </section>
      <section className="home-squad">
        <Tabs defaultValue={home.athletes[0].id}>
          {home.athletes.map((athlete) => (
            <TabsContent
              key={athlete.id}
              value={athlete.id}
              className="squad-stage"
            >
              <Image
                src={athlete.image!}
                alt={athlete.name + " Shokz 앰버서더"}
                fill
                sizes="100vw"
                loading="lazy"
              />
              <div className="squad-copy content-container">
                <p className="eyebrow">THE SHOKZ SQUAD</p>
                <h2>{athlete.name}</h2>
                <p>{athlete.role}</p>
                <LocalizedClientLink
                  href={
                    athlete.group === "ambassador"
                      ? "/pages/ambassador"
                      : "/pages/athletes"
                  }
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                  })}
                >
                  스토리 알아보기
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    data-icon="inline-end"
                  />
                </LocalizedClientLink>
              </div>
            </TabsContent>
          ))}
          <div className="squad-tabs-wrap content-container">
            <TabsList aria-label="샥즈 스쿼드">
              {home.athletes.map((athlete) => (
                <TabsTrigger
                  key={athlete.id}
                  value={athlete.id}
                  aria-label={athlete.name}
                >
                  <Image
                    src={athlete.avatar!}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                  />
                  <span>
                    {athlete.name}
                    <small>
                      {athlete.group === "ambassador" ? "앰버서더" : "애슬리트"}
                    </small>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </section>
      <section className="home-reviews content-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUT THERE. TOGETHER.</p>
            <h2>
              열린 세상 속,
              <br />
              우리의 이야기.
            </h2>
          </div>
          <p>
            샥즈와 함께하는 일상과 움직임.
            <br />
            공식몰의 커뮤니티 이야기를 소개합니다.
          </p>
        </div>
        <div className="reviews-mosaic">
          {home.reviews.map((review, index) => {
            const product = products.find(
              (product) => "/products/" + product.handle === review.href
            )
            return (
              <LocalizedClientLink
                key={review.href}
                href={review.href}
                className={"review-tile review-tile-" + index}
              >
                {review.image && (
                  <Image
                    src={review.image}
                    alt={(product?.title ?? "") + " 사용자 이야기"}
                    fill
                    loading="lazy"
                    sizes="(max-width: 767px) 90vw, 45vw"
                  />
                )}
                <div>
                  <span>{product?.title}</span>
                  {review.quote && <p>{review.quote}</p>}
                  <small>{review.author || "SHOKZ COMMUNITY"}</small>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={22} />
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
        <p className="home-review-notice">
          공식몰 콘텐츠를 소개하는 전시 화면이며, 이 POC에서는 리뷰를 수집하지
          않습니다.
        </p>
      </section>
      <ProductFinder config={home.quiz} products={products} />
      <section className="shokz-section content-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">STORIES THAT MOVE US</p>
            <h2>샥즈의 새로운 이야기.</h2>
          </div>
          <LocalizedClientLink href="/journal" className="text-link">
            모든 소식 보기
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </LocalizedClientLink>
        </div>
        <div className="journal-grid">
          {articles.slice(0, 3).map((article) => (
            <LocalizedClientLink
              href={"/journal/" + article.slug}
              key={article.slug}
              className="journal-card"
            >
              {article.images[0] && (
                <div className="journal-image">
                  <Image
                    src={article.images[0]}
                    alt={article.title}
                    fill
                    sizes="(max-width: 767px) 90vw, 30vw"
                    loading="lazy"
                  />
                </div>
              )}
              <span>{article.category.toUpperCase()}</span>
              <h3>{article.title}</h3>
              <p className="text-link">
                이야기 읽기
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </p>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </>
  )
}
