import { Badge } from "@modules/common/components/ui/badge"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge variant="secondary" className={className}>
      <span className="font-semibold">테스트 모드</span> For testing purposes
      only.
    </Badge>
  )
}

export default PaymentTest
