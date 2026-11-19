import type { Metadata } from "next"
import Image from "@modules/common/components/store-image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Hero, { type BannerSlide } from "@modules/home/components/hero"
import FeaturedProducts from "@modules/home/components/featured-products"
import ProductFinder from "@modules/home/components/product-finder"
import BenefitsCarousel from "@modules/home/components/benefits-carousel"
import HomeExperience from "@modules/home/components/home-experience"
import Squad from "@modules/home/components/squad"
import home from "@/content/home.json"
import {
  cmsBannerLink,
  listCmsBanners,
  listCmsPosts,
  listReferencedProducts,
} from "@lib/data/cms"
import { cmsMediaURL } from "@/cms/media-url"
import { relationID } from "@/cms/content-model"

export const metadata: Metadata = {
  title: "SHOKZ Korea | 귀를 열고, 세상을 넓히다",
  description:
    "세상과 연결되는 샥즈 오픈이어 이어폰. 당신의 모든 움직임과 일상에 어울리는 사운드를 만나보세요.",
}

const eyebrowClassName =
  "mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a3400b] md:text-[11px]"
const headingClassName =
  "text-[clamp(30px,3.3vw,48px)] font-semibold leading-[1.35] tracking-[-0.045em]"
// 深色主题只作用于服务区，让内部卡片和轮播控件保持同一套配色。
const benefitsThemeClassName =
  "w-full overflow-hidden bg-background py-12 text-foreground [--background:150_10%_9%] [--foreground:40_20%_96%] [--card:150_7%_14%] [--card-foreground:40_20%_96%] [--muted:150_10%_9%] [--muted-foreground:140_6%_68%] [--border:145_6%_25%] [--accent:145_8%_20%] [--accent-foreground:40_20%_96%] md:py-16"

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const [
    {
      response: { products },
    },
    articles,
    banners,
  ] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: { limit: 100, order: "created_at" },
    }),
    listCmsPosts({ limit: 3 }),
    listCmsBanners(),
  ])
  const bannerProductIDs = [
    ...new Set(
      banners
        .filter((banner) => banner.linkType === "product")
        .map((banner) => relationID(banner.product))
        .filter((id): id is string => typeof id === "string")
    ),
  ]
  const bannerProducts = await listReferencedProducts(
    countryCode,
    bannerProductIDs
  )
  const handles = new Map(
    bannerProducts.flatMap(({ id, handle }) =>
      handle ? [[id, handle] as const] : []
    )
  )
  const campaigns = banners.flatMap((banner): BannerSlide[] => {
    const desktopImage = cmsMediaURL(banner.desktopImage)
    if (!desktopImage) return []
    return [
      {
        id: banner.id,
        title: banner.title,
        caption: banner.caption,
        format: banner.format,
        eyebrow: banner.eyebrow,
        headline: banner.headline,
        actionLabel: banner.actionLabel,
        href: cmsBannerLink(banner, handles),
        desktopImage,
        mobileImage: cmsMediaURL(banner.mobileImage),
        desktopVideo: cmsMediaURL(banner.desktopVideo),
        mobileVideo: cmsMediaURL(banner.mobileVideo),
      },
    ]
  })

  return (
    <HomeExperience>
      {campaigns.length > 0 && (
        <Hero
          key={campaigns.map(({ id }) => id).join(",")}
          campaigns={campaigns}
        />
      )}
      <FeaturedProducts products={products} />
      <section
        className={benefitsThemeClassName}
        id="benefits"
        aria-labelledby="benefits-title"
      >
        <div className="content-container grid gap-7 md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <div data-reveal>
            <p className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary md:text-[11px]">
              <span
                className="h-px w-7 shrink-0 bg-primary"
                aria-hidden="true"
              />
              ONLY AT SHOKZ
            </p>
            <h2
              id="benefits-title"
              className="text-[28px] font-semibold leading-[1.4] tracking-[-0.04em] md:text-[30px]"
            >
              공식몰에서 만나는
              <br />
              특별한 경험.
            </h2>
            <p className="mt-5 text-[13px] leading-7 text-muted-foreground">
              샥즈의 공식 브랜드 서비스를 만나보세요.
            </p>
            <small className="mt-5 block max-w-[280px] text-[11px] leading-6 text-muted-foreground">
              멤버십 및 서비스 신청은 POC 전시용 안내입니다.
            </small>
          </div>
          <BenefitsCarousel />
        </div>
      </section>
      <section
        className="border-y border-[#e9e6df] bg-white"
        aria-labelledby="awards-title"
      >
        <div className="content-container grid items-center gap-6 py-10 lg:grid-cols-[0.9fr_1.5fr] lg:gap-10 lg:py-12">
          <div data-reveal>
            <p className={eyebrowClassName}>RECOGNIZED AROUND THE WORLD</p>
            <h2
              id="awards-title"
              className="text-[27px] font-semibold leading-[1.5] tracking-[-0.035em] md:text-[31px]"
            >
              파트너십으로 만든 성과.
              <br />
              디자인으로 입증한 가치.
            </h2>
          </div>
          <div
            className="grid grid-cols-2 gap-px overflow-hidden border border-[#e9e6df] bg-[#e9e6df] sm:grid-cols-3 lg:grid-cols-4"
            data-reveal
          >
            {home.awards.map((award) => (
              <div
                key={award}
                className="flex items-center justify-center bg-[#faf9f6] p-2"
              >
                <Image
                  src={award}
                  alt="Shokz 파트너십 및 수상"
                  width={180}
                  height={180}
                  loading="lazy"
                  className="h-28 w-full object-contain mix-blend-multiply sm:h-32 lg:h-36"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Squad />
      <section
        className="content-container py-16 md:py-24"
        id="community"
        aria-labelledby="community-title"
      >
        <div
          className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end"
          data-reveal
        >
          <div>
            <p className={eyebrowClassName}>OUT THERE. TOGETHER.</p>
            <h2 id="community-title" className={headingClassName}>
              열린 세상 속,
              <br />
              우리의 이야기.
            </h2>
          </div>
          <p className="text-xs leading-7 text-[#6b6864] md:text-[13px]">
            샥즈와 함께하는 일상과 움직임.
            <br />
            공식몰의 커뮤니티 이야기를 소개합니다.
          </p>
        </div>
        <div
          className="grid auto-cols-[86%] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain pb-3 [scroll-snap-type:x_mandatory] [scrollbar-color:#d96427_#e9e5de] [scrollbar-width:thin] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6008] md:grid-flow-row md:grid-cols-[1.1fr_1fr_1fr] md:grid-rows-[repeat(2,250px)] md:overflow-visible md:pb-0"
          role="region"
          aria-label="샥즈 커뮤니티 이야기"
          tabIndex={0}
        >
          {home.reviews.map((review, index) => {
            const product = products.find(
              (product) => "/products/" + product.handle === review.href
            )
            return (
              <LocalizedClientLink
                key={review.href}
                href={review.href}
                className={
                  "group relative isolate min-h-[400px] min-w-0 snap-start overflow-hidden rounded-xl bg-[#263333] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#ff813f] md:min-h-0 " +
                  (index === 0 ? "md:row-span-2" : "")
                }
                data-reveal
              >
                {review.image && (
                  <Image
                    src={review.image}
                    alt={(product?.title ?? "") + " 사용자 이야기"}
                    fill
                    loading="lazy"
                    sizes={
                      index === 0
                        ? "(max-width: 767px) 86vw, 35vw"
                        : "(max-width: 767px) 86vw, 30vw"
                    }
                    className="-z-20 object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-[1.045] group-focus-visible:scale-[1.045]"
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-5 bottom-6 md:inset-x-6">
                  <span className="text-[11px] font-medium tracking-[0.04em] text-[#ffb48a]">
                    {product?.title}
                  </span>
                  {review.quote && (
                    <p
                      className={
                        "mt-3 leading-[1.85] " +
                        (index === 0
                          ? "text-[17px] md:text-lg"
                          : "text-[15px] md:text-sm")
                      }
                    >
                      {review.quote}
                    </p>
                  )}
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <small className="text-[11px] text-[#e3e6e4]">
                      {review.author || "SHOKZ COMMUNITY"}
                    </small>
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full border border-white/60 transition-[background-color,border-color,transform] group-hover:translate-x-1 group-hover:border-[#ff6008] group-hover:bg-[#ff6008] group-hover:text-[#171717]"
                      aria-hidden="true"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} size={19} />
                    </span>
                  </div>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
        <p className="mt-5 text-[11px] leading-6 text-[#716d65]">
          공식몰 콘텐츠를 소개하는 전시 화면이며, 이 POC에서는 리뷰를 수집하지
          않습니다.
        </p>
      </section>
      <ProductFinder config={home.quiz} products={products} />
      <section
        className="content-container py-16 md:py-24"
        id="journal"
        aria-labelledby="journal-title"
      >
        <div
          className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end"
          data-reveal
        >
          <div>
            <p className={eyebrowClassName}>STORIES THAT MOVE US</p>
            <h2 id="journal-title" className={headingClassName}>
              샥즈의 새로운 이야기.
            </h2>
          </div>
          <LocalizedClientLink
            href="/journal"
            className="group inline-flex min-h-11 items-center gap-4 text-[13px] font-medium hover:text-[#a3400b]"
          >
            모든 소식 보기
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={19}
              className="transition-transform group-hover:translate-x-1"
            />
          </LocalizedClientLink>
        </div>
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {articles.map((article) => {
            const photo = cmsMediaURL(article.photos?.[0])
            return (
              <LocalizedClientLink
                href={"/journal/" + article.slug}
                key={article.slug}
                className="group flex min-w-0 flex-col border-b border-[#dedbd4] pb-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6008]"
                data-reveal
              >
                {photo && (
                  <div className="relative mb-6 aspect-[1.4] overflow-hidden rounded-xl bg-[#f2f0ea]">
                    <Image
                      src={photo}
                      alt={article.title}
                      fill
                      sizes="(max-width: 767px) 90vw, 30vw"
                      loading="lazy"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-[1.045] group-focus-visible:scale-[1.045]"
                    />
                  </div>
                )}
                <span className="text-[10px] font-semibold tracking-[0.14em] text-[#a3400b]">
                  {article.category.toUpperCase()}
                </span>
                <h3 className="mb-5 mt-3 text-lg font-semibold leading-[1.7] tracking-[-0.025em] md:text-xl">
                  {article.title}
                </h3>
                <span className="mt-auto flex min-h-11 items-center justify-between text-xs font-medium">
                  이야기 읽기
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>
      </section>
    </HomeExperience>
  )
}
