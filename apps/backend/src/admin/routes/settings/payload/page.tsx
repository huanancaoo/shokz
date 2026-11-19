import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"

export const config = defineRouteConfig({ label: "Payload" })

const PayloadSettings = () => {
  const sync = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/payload/sync", { method: "POST" }),
    onSuccess: () => toast.success("商品同步已提交"),
    onError: (error) => toast.error(error.message),
  })

  return (
    <Container className="flex flex-col items-start gap-4">
      <Heading level="h1">Payload 商品同步</Heading>
      <Text className="text-ui-fg-subtle">
        将 Medusa 已发布的商品同步到 Payload，供内容编辑时引用。
      </Text>
      <Button isLoading={sync.isPending} onClick={() => sync.mutate()}>
        同步商品
      </Button>
    </Container>
  )
}

export default PayloadSettings
