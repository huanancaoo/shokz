import { getTranslation } from "@payloadcms/translations"
import { groupNavItems } from "@payloadcms/ui/shared"
import { EntityType, type ServerProps } from "payload"
import { formatAdminURL } from "payload/shared"
import { SidebarBrand } from "./branding"
import { PayloadSidebar } from "./sidebar-menu"

export function AdminSidebar({
  i18n,
  payload,
  permissions,
  user,
  visibleEntities,
}: ServerProps) {
  if (!permissions || !visibleEntities) return null

  const { admin: adminRoute } = payload.config.routes
  const groups = groupNavItems(
    [
      ...payload.config.collections
        .filter(({ slug }) => visibleEntities.collections.includes(slug))
        .map((entity) => ({ entity, type: EntityType.collection } as const)),
      ...payload.config.globals
        .filter(({ slug }) => visibleEntities.globals.includes(slug))
        .map((entity) => ({ entity, type: EntityType.global } as const)),
    ],
    permissions,
    i18n
  ).map(({ label, entities }) => ({
    label: getTranslation(label, i18n),
    primary: entities.some(({ slug }) => slug === "posts"),
    links: entities.map(({ label, slug, type }) => ({
      href: formatAdminURL({ adminRoute, path: `/${type}/${slug}` }),
      label: getTranslation(label, i18n),
    })),
  }))
  groups.sort((left, right) => Number(right.primary) - Number(left.primary))
  const accountLabel = i18n.t("authentication:account")

  return (
    <PayloadSidebar
      account={{
        href: formatAdminURL({
          adminRoute,
          path: payload.config.admin.routes.account,
        }),
        label: accountLabel,
      }}
      brand={<SidebarBrand i18n={i18n} payload={payload} />}
      closeLabel={i18n.t("general:close")}
      groups={groups}
      home={{ href: adminRoute, label: i18n.t("general:dashboard") }}
      logout={{
        href: formatAdminURL({
          adminRoute,
          path: payload.config.admin.routes.logout,
        }),
        label: i18n.t("authentication:logOut"),
      }}
      profileLabel={user?.collection === "users" ? user.email : accountLabel}
    />
  )
}
