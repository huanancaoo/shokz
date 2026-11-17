import { HugeiconsIcon } from "@hugeicons/react"
import { PackageIcon } from "@hugeicons/core-free-icons"

const TransferImage = () => (
  <div
    className="flex size-40 items-center justify-center rounded-full bg-muted"
    aria-hidden="true"
  >
    <HugeiconsIcon icon={PackageIcon} size={72} strokeWidth={1.4} />
  </div>
)

export default TransferImage
