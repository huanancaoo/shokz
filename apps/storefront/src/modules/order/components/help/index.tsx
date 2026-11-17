import { Heading } from "@/components/typography"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">도움이 필요하신가요?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/pages/support">
              고객지원
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/returns">
              교환 및 반품
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
