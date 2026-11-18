"use client"

import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import { useRef, useState, useTransition } from "react"
import { deleteCustomerAddress } from "@lib/data/customer"
import { Alert, AlertDescription } from "@modules/common/components/ui/alert"
import { Badge } from "@modules/common/components/ui/badge"
import { Button } from "@modules/common/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@modules/common/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@modules/common/components/ui/empty"
import { Spinner } from "@modules/common/components/ui/spinner"
import AccountPageHeader from "../account-page-header"
import AddressDialog from "./address-dialog"

type Address = HttpTypes.StoreCustomerAddress

function recipientName(address: Address) {
  return [address.last_name, address.first_name].filter(Boolean).join(" ")
}

export default function AddressBook({
  addresses,
  region,
  countryCode,
}: {
  addresses: Address[]
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const [message, setMessage] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null)
  const [deleteError, setDeleteError] = useState(false)
  const [deleting, startDelete] = useTransition()
  const addTrigger = useRef<HTMLButtonElement>(null)
  const deleteTrigger = useRef<HTMLButtonElement>(null)

  function remove(address: Address) {
    startDelete(async () => {
      const { success } = await deleteCustomerAddress(address.id)
      setDeleteError(!success)

      if (success) {
        // 삭제된 카드의 버튼 대신 목록의 추가 버튼으로 초점을 돌려준다.
        deleteTrigger.current = null
        setDeleteTarget(null)
        setMessage("배송지를 삭제했습니다.")
      }
    })
  }

  return (
    <div className="space-y-5">
      <AccountPageHeader
        title="배송지 관리"
        description="저장한 배송지는 주문할 때 바로 선택할 수 있어요."
        action={
          <AddressDialog
            region={region}
            countryCode={countryCode}
            onSaved={() => setMessage("배송지를 추가했습니다.")}
            trigger={
              <Button
                ref={addTrigger}
                type="button"
                className="h-11 gap-2 px-4"
                data-testid="add-address-button"
              >
                <HugeiconsIcon icon={Add01Icon} aria-hidden />
                배송지 추가
              </Button>
            }
          />
        }
      />
      <p
        role="status"
        className={
          message
            ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            : "sr-only"
        }
      >
        {message}
      </p>
      {addresses.length === 0 ? (
        <Empty className="min-h-56 border border-solid bg-background">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-11 rounded-full bg-accent text-accent-foreground [&_svg]:size-5"
            >
              <HugeiconsIcon icon={Location01Icon} aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              <h2 className="text-base font-semibold">
                저장된 배송지가 없어요
              </h2>
            </EmptyTitle>
            <EmptyDescription>
              배송지를 추가해 두면 주문할 때 주소를 다시 입력할 필요가 없어요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            const country = address.country_code
            const countryLabel =
              country === "kr"
                ? "대한민국"
                : region.countries?.find(({ iso_2 }) => iso_2 === country)
                    ?.display_name ?? country?.toUpperCase()

            return (
              <li
                key={address.id}
                className="flex min-w-0 flex-col rounded-2xl border bg-background p-4 sm:p-5"
                data-testid="address-container"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={19}
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1 [overflow-wrap:anywhere]">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="font-semibold">
                        {recipientName(address)}
                      </h2>
                      {address.is_default_shipping && (
                        <Badge variant="secondary">기본 배송지</Badge>
                      )}
                    </div>
                    {address.company && (
                      <p
                        className="text-xs text-muted-foreground"
                        data-testid="address-company"
                      >
                        {address.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex-1 space-y-1 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                  <p className="text-foreground" data-testid="address-address">
                    {[
                      address.province,
                      address.city,
                      address.address_1,
                      address.address_2,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  <p data-testid="address-postal-city">
                    {[address.postal_code, countryLabel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {address.phone && <p>{address.phone}</p>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  <AddressDialog
                    address={address}
                    region={region}
                    countryCode={countryCode}
                    onSaved={() => setMessage("배송지를 수정했습니다.")}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 gap-1.5 px-3"
                        data-testid="address-edit-button"
                      >
                        <HugeiconsIcon icon={Edit02Icon} aria-hidden />
                        수정
                      </Button>
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 gap-1.5 px-3 text-muted-foreground"
                    data-testid="address-delete-button"
                    onClick={(event) => {
                      deleteTrigger.current = event.currentTarget
                      setDeleteError(false)
                      setDeleteTarget(address)
                    }}
                  >
                    <HugeiconsIcon icon={Delete02Icon} aria-hidden />
                    삭제
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <Dialog
        open={deleteTarget !== null}
        disablePointerDismissal
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <DialogContent
          showCloseButton={false}
          finalFocus={() => deleteTrigger.current ?? addTrigger.current}
          className="gap-5 rounded-2xl bg-background p-5 sm:max-w-[26rem] sm:p-6"
          data-testid="delete-address-modal"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              배송지를 삭제할까요?
            </DialogTitle>
            <DialogDescription className="break-words">
              {deleteTarget && (
                <strong className="block text-foreground">
                  {recipientName(deleteTarget)} · {deleteTarget.address_1}
                </strong>
              )}
              계정에 저장된 배송지 목록에서 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>
                배송지를 삭제하지 못했습니다. 다시 시도해 주세요.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter className="mx-0 mb-0 flex-row justify-end rounded-none bg-background p-0 pt-4">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="h-11 px-4"
                  disabled={deleting}
                />
              }
            >
              취소
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              className="h-11 px-4"
              disabled={deleting}
              onClick={() => deleteTarget && remove(deleteTarget)}
            >
              {deleting && <Spinner data-icon="inline-start" />}
              {deleting ? "삭제 중" : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
