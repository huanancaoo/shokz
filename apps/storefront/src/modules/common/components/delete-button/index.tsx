import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { deleteLineItem } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { Button } from "@modules/common/components/ui/button"

import { cn as clx } from "@lib/utils"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    setError("")
    await deleteLineItem(id)
      .then(notifyCartUpdated)
      .catch((error) => {
        setError(error.message)
        setIsDeleting(false)
      })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={children ? "sm" : "icon-sm"}
        aria-label="장바구니 상품 삭제"
        disabled={isDeleting}
        className="flex gap-x-1 text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? (
          <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={Delete02Icon} />
        )}
        <span>{children}</span>
      </Button>
      {error && <span role="alert">{error}</span>}
    </div>
  )
}

export default DeleteButton
