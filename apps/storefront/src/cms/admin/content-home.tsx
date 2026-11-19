import {
  File01Icon,
  Image01Icon,
  Notebook01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons"
import { getTranslation } from "@payloadcms/translations"
import type { WidgetServerProps } from "payload"
import { formatAdminURL } from "payload/shared"
import { ContentShortcut } from "./content-shortcut"

const shortcuts = [
  {
    slug: "posts",
    icon: Notebook01Icon,
    description: {
      en: "Write and publish articles",
      ko: "게시글 작성 및 발행",
      zh: "撰写和发布文章",
    },
  },
  {
    slug: "banners",
    icon: Image01Icon,
    description: {
      en: "Manage homepage media and links",
      ko: "홈페이지 배너 이미지 및 링크 관리",
      zh: "维护首页焦点图、视频和跳转链接",
    },
  },
  {
    slug: "pages",
    icon: File01Icon,
    description: {
      en: "Edit and publish site pages",
      ko: "사이트 페이지 편집 및 발행",
      zh: "编辑和发布站点页面",
    },
  },
  {
    slug: "medusa-products",
    icon: PackageIcon,
    description: {
      en: "Browse products for content references",
      ko: "콘텐츠에 연결할 상품 확인",
      zh: "查看可关联到内容的商品",
    },
  },
] as const

export async function ContentHome({ permissions, req }: WidgetServerProps) {
  const { i18n, payload } = req
  const visibleShortcuts = shortcuts.filter(
    ({ slug }) => permissions?.collections?.[slug]?.read
  )
  if (!visibleShortcuts.length) return null

  const entries = await Promise.all(
    visibleShortcuts.map(async (entry) => {
      const { totalDocs } = await payload.count({
        collection: entry.slug,
        overrideAccess: false,
        req,
      })
      return { ...entry, totalDocs }
    })
  )
  const numbers = new Intl.NumberFormat(i18n.language)

  return (
    <section
      aria-labelledby="shokz-content-title"
      className="shokz-content-home"
    >
      <h1 className="shokz-content-heading" id="shokz-content-title">
        {getTranslation(
          { en: "Website content", ko: "웹사이트 콘텐츠", zh: "网站内容" },
          i18n
        )}
      </h1>
      <ul className="shokz-content-shortcuts">
        {entries.map(({ description, icon, slug, totalDocs }) => (
          <li key={slug}>
            <ContentShortcut
              count={numbers.format(totalDocs)}
              description={getTranslation(description, i18n)}
              href={formatAdminURL({
                adminRoute: payload.config.routes.admin,
                path: `/collections/${slug}`,
              })}
              icon={icon}
              label={getTranslation(
                payload.collections[slug].config.labels.plural,
                i18n
              )}
              status={
                slug === "medusa-products"
                  ? getTranslation(
                      { en: "Read only", ko: "읽기 전용", zh: "只读" },
                      i18n
                    )
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
