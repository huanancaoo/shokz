import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full text-foreground">
      <HugeiconsIcon icon={Loading03Icon} size={36} />
    </div>
  )
}
