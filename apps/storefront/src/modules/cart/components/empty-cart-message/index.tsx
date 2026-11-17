import { Heading, Text } from "@/components/typography"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-48 px-2 flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        장바구니
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        아직 담긴 상품이 없습니다. 당신의 일상에 어울리는 샥즈를 만나보세요.
      </Text>
      <div>
        <InteractiveLink href="/store">제품 둘러보기</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
