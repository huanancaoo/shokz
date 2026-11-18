import {
  ArrowRight01Icon,
  Location01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AccountPageHeader from "../account-page-header"

const shortcutClassName =
  "flex min-w-0 items-center gap-3 rounded-2xl border bg-background p-4 transition-colors hover:border-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:p-5"

export default function Overview({
  customer,
  orders,
}: {
  customer: HttpTypes.StoreCustomer
  orders: HttpTypes.StoreOrder[] | null
}) {
  const addresses = customer.addresses ?? []
  const profileCompletion =
    [
      Boolean(customer.email),
      Boolean(customer.first_name && customer.last_name),
      Boolean(customer.phone),
      addresses.some((address) => address.is_default_billing),
    ].filter(Boolean).length * 25

  return (
    <div className="space-y-5" data-testid="overview-page-wrapper">
      <AccountPageHeader
        title="내 계정"
        description={
          <>
            <span
              className="block font-medium text-foreground"
              data-testid="welcome-message"
              data-value={customer.first_name}
            >
              {customer.first_name
                ? `${customer.first_name}님, 안녕하세요.`
                : "안녕하세요."}
            </span>
            <span data-testid="customer-email" data-value={customer.email}>
              {customer.email}
            </span>
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <LocalizedClientLink
          href="/account/profile"
          className={shortcutClassName}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <HugeiconsIcon icon={UserIcon} size={21} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">회원 정보</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span
                className="font-semibold text-foreground"
                data-testid="customer-profile-completion"
                data-value={profileCompletion}
              >
                {profileCompletion}%
              </span>{" "}
              입력 완료
            </p>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} aria-hidden />
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/account/addresses"
          className={shortcutClassName}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <HugeiconsIcon icon={Location01Icon} size={21} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">배송지 관리</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span
                className="font-semibold text-foreground"
                data-testid="addresses-count"
                data-value={addresses.length}
              >
                {addresses.length}개
              </span>{" "}
              저장됨
            </p>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} aria-hidden />
        </LocalizedClientLink>
      </div>
      <section
        aria-labelledby="recent-orders-title"
        className="rounded-2xl border bg-background"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-5">
          <h2 id="recent-orders-title" className="text-base font-semibold">
            최근 주문
          </h2>
          <LocalizedClientLink
            href="/account/orders"
            aria-label="전체 주문 보기"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-accent-foreground hover:underline"
          >
            전체 보기{" "}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden />
          </LocalizedClientLink>
        </div>
        {orders?.length ? (
          <ul className="divide-y border-t" data-testid="orders-wrapper">
            {orders.slice(0, 5).map((order) => (
              <li
                key={order.id}
                data-testid="order-wrapper"
                data-value={order.id}
              >
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5"
                  data-testid="open-order-button"
                >
                  <div className="space-y-1">
                    <p
                      className="text-sm font-semibold"
                      data-testid="order-id"
                      data-value={order.display_id}
                    >
                      주문 #{order.display_id}
                    </p>
                    <time
                      className="block text-xs text-muted-foreground"
                      dateTime={new Date(order.created_at).toISOString()}
                      data-testid="order-created-date"
                    >
                      {new Date(order.created_at).toLocaleDateString("ko-KR")}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span data-testid="order-amount">
                      {convertToLocale({
                        amount: order.total,
                        currency_code: order.currency_code,
                      })}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="border-t px-4 py-7 text-sm text-muted-foreground sm:px-5"
            data-testid="no-orders-message"
          >
            {orders
              ? "아직 주문 내역이 없어요."
              : "최근 주문을 불러오지 못했어요."}
          </p>
        )}
      </section>
    </div>
  )
}
