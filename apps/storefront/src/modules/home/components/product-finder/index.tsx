"use client"

import { useState } from "react"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  RefreshIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@modules/common/components/ui/toggle-group"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"

export type FinderConfig = {
  title: string
  subtitle: string
  resultTitle: string
  resultSub: string
  q1: string
  scenes: { id: string; title: string; image: string | null; desc?: string }[]
  branches: Record<
    string,
    {
      skip: boolean
      question: string
      products?: string[]
      options: { id: string; label: string; products: string[] }[]
    }
  >
}

export default function ProductFinder({
  config,
  products,
}: {
  config: FinderConfig
  products: HttpTypes.StoreProduct[]
}) {
  const [step, setStep] = useState(1)
  const [scene, setScene] = useState("")
  const [focus, setFocus] = useState("")
  const branch = config.branches[scene]
  const resultHandles = branch?.skip
    ? branch.products
    : branch?.options.find((option) => option.id === focus)?.products
  const recommended =
    resultHandles
      ?.map((handle) => products.find((product) => product.handle === handle))
      .filter((product): product is HttpTypes.StoreProduct =>
        Boolean(product)
      ) ?? []
  function chooseScene(id: string) {
    setScene(id)
    setFocus("")
    setStep(config.branches[id].skip ? 3 : 2)
  }
  function reset() {
    setStep(1)
    setScene("")
    setFocus("")
  }

  return (
    <section className="product-finder" id="find-your-shokz">
      <div className="content-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A SOUND THAT&apos;S YOURS</p>
            <h2>{config.title}</h2>
          </div>
          <p>{config.subtitle}</p>
        </div>
        <div className="finder-progress" aria-label="제품 찾기 단계">
          {[1, 2, 3].map((value) => (
            <Button
              key={value}
              variant="ghost"
              disabled={value > step || (value === 2 && branch?.skip)}
              aria-current={step === value ? "step" : undefined}
              onClick={() => setStep(value)}
            >
              <span>
                {value < step ? (
                  <HugeiconsIcon icon={Tick01Icon} size={14} />
                ) : (
                  String(value).padStart(2, "0")
                )}
              </span>
              {["나의 라이프스타일", "중요한 한 가지", "추천 제품"][value - 1]}
            </Button>
          ))}
        </div>
        {step === 1 && (
          <div className="finder-step">
            <h3>{config.q1}</h3>
            <div className="finder-scenes">
              {config.scenes.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => chooseScene(item.id)}
                  className="finder-scene"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 75vw, 24vw"
                      loading="lazy"
                    />
                  )}
                  <span>
                    <strong>{item.title}</strong>
                    {item.desc && <small>{item.desc}</small>}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && branch && (
          <div className="finder-step">
            <h3>{branch.question}</h3>
            <ToggleGroup
              value={focus ? [focus] : []}
              onValueChange={(values) => setFocus(values[0] ?? "")}
              className="finder-options"
              aria-label={branch.question}
            >
              {branch.options.map((option, index) => (
                <ToggleGroupItem key={option.id} value={option.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{option.label}</strong>
                  <HugeiconsIcon icon={Tick01Icon} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="finder-actions">
              <Button variant="outline" onClick={() => setStep(1)}>
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  data-icon="inline-start"
                />
                이전
              </Button>
              <Button disabled={!focus} onClick={() => setStep(3)}>
                추천 제품 보기
                <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
              </Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="finder-step finder-result" aria-live="polite">
            <p className="eyebrow">YOUR PERFECT MATCH</p>
            <h3>{config.resultTitle}</h3>
            <p>{config.resultSub}</p>
            <div className="finder-result-products">
              {recommended.map((product) => (
                <LocalizedClientLink
                  key={product.id}
                  href={"/products/" + product.handle}
                  className="finder-result-card"
                >
                  {product.thumbnail && (
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={300}
                      height={300}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h4>{product.title}</h4>
                    <strong>
                      {
                        getProductPrice({ product }).cheapestPrice
                          ?.calculated_price
                      }
                    </strong>
                    <span>
                      제품 알아보기
                      <HugeiconsIcon icon={ArrowRight01Icon} size={17} />
                    </span>
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
            <div className="finder-actions">
              {recommended.length > 1 && (
                <LocalizedClientLink
                  className={buttonVariants()}
                  href={
                    "/compare?products=" +
                    recommended.map((product) => product.handle).join(",")
                  }
                >
                  추천 제품 비교하기
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </LocalizedClientLink>
              )}
              <Button variant="outline" onClick={reset}>
                <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
                다시 찾기
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
