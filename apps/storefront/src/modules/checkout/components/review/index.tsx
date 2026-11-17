"use client"

import { cn as clx } from "@lib/utils"
import { Heading, Text } from "@/components/typography"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    cart.payment_collection

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          주문 확인
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="text-sm font-medium text-foreground mb-1">
                주문 내용을 확인하고{" "}
                <LocalizedClientLink href="/pages/terms" className="underline">
                  이용약관
                </LocalizedClientLink>
                ,{" "}
                <LocalizedClientLink href="/returns" className="underline">
                  교환 및 반품 안내
                </LocalizedClientLink>
                ,{" "}
                <LocalizedClientLink
                  href="/pages/privacy"
                  className="underline"
                >
                  개인정보처리방침
                </LocalizedClientLink>
                에 동의합니다. POC 테스트 주문이며 실제 결제나 배송은 진행되지
                않습니다.
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
