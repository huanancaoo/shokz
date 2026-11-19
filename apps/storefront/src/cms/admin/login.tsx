import { redirect } from "next/navigation"
import type { AdminViewServerProps } from "payload"
import { formatAdminURL, getSafeRedirect } from "payload/shared"
import {
  Card,
  CardContent,
  CardHeader,
} from "@modules/common/components/ui/card"
import { ShokzLogo } from "./branding"
import { LoginForm } from "./login-form"

export function AdminLogin({
  initPageResult,
  searchParams,
}: AdminViewServerProps) {
  const { i18n, payload, user } = initPageResult.req
  const { admin, routes } = payload.config
  const destination = getSafeRedirect({
    fallbackTo: routes.admin,
    redirectTo: searchParams?.redirect ?? routes.admin,
  })

  if (user) redirect(destination)

  return (
    <Card aria-labelledby="cms-login-title" className="gap-7 p-7 small:p-9">
      <CardHeader className="items-center gap-5 p-0 text-center">
        <div className="flex justify-center [&_img]:h-auto [&_img]:w-44">
          <ShokzLogo />
        </div>
        <h1 className="m-0 text-2xl font-semibold" id="cms-login-title">
          {i18n.t("authentication:login")}
        </h1>
      </CardHeader>
      <CardContent className="p-0">
        <LoginForm
          action={formatAdminURL({
            apiRoute: routes.api,
            path: `/${admin.user}/login`,
          })}
          destination={destination}
          forgotURL={formatAdminURL({
            adminRoute: routes.admin,
            path: admin.routes.forgot,
          })}
        />
      </CardContent>
    </Card>
  )
}
