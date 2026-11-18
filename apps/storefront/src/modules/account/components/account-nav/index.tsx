"use client"

import {
  DashboardSquare01Icon,
  Location01Icon,
  Logout01Icon,
  PackageIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useParams, usePathname } from "next/navigation"
import { signout } from "@lib/data/customer"
import { cn } from "@lib/utils"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { Button } from "@modules/common/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@modules/common/components/ui/dialog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const links = [
  {
    href: "/account",
    label: "내 계정",
    icon: DashboardSquare01Icon,
    testId: "overview-link",
  },
  {
    href: "/account/profile",
    label: "회원 정보",
    icon: UserIcon,
    testId: "profile-link",
  },
  {
    href: "/account/addresses",
    label: "배송지 관리",
    icon: Location01Icon,
    testId: "addresses-link",
  },
  {
    href: "/account/orders",
    label: "주문 내역",
    icon: PackageIcon,
    testId: "orders-link",
  },
]

export default function AccountNav() {
  const pathname = usePathname()
  const { countryCode } = useParams<{ countryCode: string }>()

  return (
    <nav
      aria-label="마이페이지"
      className="overflow-hidden rounded-2xl border bg-background"
      data-testid="account-nav"
    >
      <p className="hidden px-5 pb-1 pt-5 text-base font-semibold small:block">
        마이페이지
      </p>
      <ul className="grid grid-cols-4 gap-1 p-2 small:grid-cols-1 small:p-3">
        {links.map(({ href, label, icon, testId }) => {
          const target = `/${countryCode}${href}`
          const current = pathname === target
          const active =
            current ||
            (href !== "/account" && pathname.startsWith(`${target}/`))

          return (
            <li key={href} className="min-w-0">
              <LocalizedClientLink
                href={href}
                aria-current={
                  current ? "page" : active ? "location" : undefined
                }
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring small:min-h-11 small:flex-row small:justify-start small:gap-3 small:px-3 small:text-left small:text-sm",
                  active
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={testId}
              >
                <HugeiconsIcon icon={icon} size={19} aria-hidden />
                <span>{label}</span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
      <div className="flex justify-end border-t px-2 small:block small:p-2">
        <Dialog>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-10 gap-2 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive small:w-full small:justify-start small:text-sm"
                data-testid="logout-button"
              />
            }
          >
            <HugeiconsIcon icon={Logout01Icon} aria-hidden />
            로그아웃
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="gap-5 rounded-2xl bg-background p-5 sm:max-w-[26rem] sm:p-6"
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                로그아웃할까요?
              </DialogTitle>
              <DialogDescription>
                회원 정보와 주문 내역은 다시 로그인한 뒤 확인할 수 있어요.
              </DialogDescription>
            </DialogHeader>
            <form action={signout.bind(null, countryCode)}>
              <DialogFooter className="mx-0 mb-0 flex-row justify-end rounded-none bg-background p-0 pt-4">
                <DialogClose
                  render={<Button variant="outline" className="h-11 px-4" />}
                >
                  취소
                </DialogClose>
                <SubmitButton
                  className="h-11 px-4"
                  data-testid="confirm-logout-button"
                >
                  로그아웃
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  )
}
