import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { retrieveCustomer } from "@lib/data/customer"

export async function generateMetadata(): Promise<Metadata> {
  const customer = await retrieveCustomer()
  return {
    title: customer ? "마이페이지 | SHOKZ Korea" : "로그인 | SHOKZ Korea",
    description: "샥즈 계정과 주문 내역을 확인하세요.",
  }
}

export default function Login() {
  return <LoginTemplate />
}
