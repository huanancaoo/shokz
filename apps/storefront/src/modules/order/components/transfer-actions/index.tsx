"use client"
import { Spinner } from "@modules/common/components/ui/spinner"

import { acceptTransferRequest, declineTransferRequest } from "@lib/data/orders"
import { Button } from "@modules/common/components/ui/button"
import { Text } from "@/components/typography"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <Text className="text-emerald-500">주문이 계정에 연결되었습니다.</Text>
      )}
      {status?.decline === "success" && (
        <Text className="text-emerald-500">주문 연결이 거절되었습니다.</Text>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <Button
            size="lg"
            onClick={acceptTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.accept === "pending" && (
              <Spinner data-icon="inline-start" />
            )}
            주문 연결 수락
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={declineTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.decline === "pending" && (
              <Spinner data-icon="inline-start" />
            )}
            주문 연결 거절
          </Button>
        </div>
      )}
      {errorMessage && <Text className="text-red-500">{errorMessage}</Text>}
    </div>
  )
}

export default TransferActions
