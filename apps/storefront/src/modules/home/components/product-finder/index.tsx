"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "@modules/common/components/store-image"
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
import { cn } from "@lib/utils"

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

const steps = ["나의 라이프스타일", "중요한 한 가지", "추천 제품"]
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff9a60]"
const eyebrow =
  "mb-[18px] text-[10px] font-semibold tracking-[0.17em] text-[#ff9a60] max-md:mb-3.5 max-md:text-[9px]"
const primaryAction =
  "h-auto min-h-12 gap-3.5 rounded-md border-[#ff7a32] bg-[#ff7a32] px-6 py-3 text-[13px] text-[#18201b] hover:border-[#ff9f66] hover:bg-[#ff9f66] disabled:border-[#758277] disabled:bg-[#758277] disabled:text-[#132017] disabled:opacity-100 max-md:min-h-[46px] max-md:gap-2.5 max-md:px-4 max-md:text-xs"
const secondaryAction =
  "h-auto min-h-12 gap-2.5 rounded-md border border-[#728073] bg-[#1a231e] px-5 py-3 text-xs text-[#f1f3ed] hover:border-[#b5c1af] hover:bg-[#324135] hover:text-white max-md:min-h-[46px] max-md:px-4"

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
  const previousStep = useRef(step)
  const heading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const questionId = useId()
  const branch = config.branches[scene]
  const selectedScene = config.scenes.find((item) => item.id === scene)
  const selectedOption = branch?.options.find((option) => option.id === focus)
  const resultHandles = branch?.skip
    ? branch.products
    : selectedOption?.products
  const recommended =
    resultHandles
      ?.map((handle) => products.find((product) => product.handle === handle))
      .filter((product): product is HttpTypes.StoreProduct =>
        Boolean(product)
      ) ?? []
  const question =
    step === 1 ? config.q1 : step === 2 ? branch.question : config.resultTitle

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    // 选择后原按钮会卸载，将焦点移到新问题，避免键盘用户丢失当前位置。
    heading.current!.focus({ preventScroll: true })
    heading.current!.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }, [step])

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
    <section
      className="product-finder bg-[#1a231e] py-[clamp(56px,6vw,90px)] text-[#f8f7f2] max-md:py-[52px]"
      id="find-your-shokz"
      aria-labelledby={titleId}
      data-step={step}
    >
      <div className="content-container">
        <div
          className="mb-10 grid grid-cols-[1fr_auto] items-end gap-8 max-lg:grid-cols-1 max-lg:gap-[18px] max-md:mb-[26px] max-md:gap-4"
          data-reveal
        >
          <div>
            <p className={eyebrow}>A SOUND THAT&apos;S YOURS</p>
            <h2
              id={titleId}
              className="max-w-[780px] whitespace-pre-line text-[clamp(32px,3.4vw,48px)] font-[650] leading-[1.35] tracking-[-1.7px] max-md:text-[31px] max-md:leading-[1.4] max-md:tracking-[-1.3px]"
            >
              {config.title}
            </h2>
          </div>
          <p className="mb-[5px] max-w-[245px] text-[13px] leading-[1.8] text-[#ccd1cb] max-lg:max-w-none max-md:text-xs">
            {config.subtitle}
          </p>
        </div>
        <nav className="mb-[34px] max-md:mb-[26px]" aria-label="제품 찾기 단계">
          <ol className="grid grid-cols-3 gap-6 max-md:gap-3">
            {steps.map((label, index) => {
              const value = index + 1
              const skipped = value === 2 && branch?.skip
              const completed = value < step && !skipped
              return (
                <li key={label}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={value > step || skipped}
                    aria-current={step === value ? "step" : undefined}
                    data-complete={completed || undefined}
                    className={cn(
                      "relative flex h-auto min-h-[66px] w-full items-center justify-start gap-3 whitespace-normal rounded-none border-0 border-b border-[#566157] bg-transparent px-0 pb-[18px] pt-0 text-left text-xs text-[#b4bcb5] transition-colors hover:bg-transparent enabled:hover:text-[#ffac7c] disabled:cursor-default disabled:text-[#838e85] disabled:opacity-100 motion-reduce:transition-none max-md:grid max-md:min-h-[88px] max-md:content-start max-md:justify-items-start max-md:gap-2.5 max-md:pb-[15px] max-md:text-[10px] max-md:leading-[1.5]",
                      focusRing,
                      completed && "text-[#e4e8e1]",
                      step === value &&
                        "border-b-[3px] border-[#ff7a32] font-[650] text-white"
                    )}
                    onClick={() => setStep(value)}
                  >
                    <span
                      className={cn(
                        "grid size-[31px] shrink-0 place-items-center rounded border border-[#6e7a70] font-sans text-[11px] max-md:size-[27px] max-md:text-[10px]",
                        completed && "border-[#829a86] text-[#aaccad]",
                        step === value &&
                          "border-[#ff7a32] bg-[#ff7a32] text-[#1a231e]"
                      )}
                    >
                      {completed ? (
                        <HugeiconsIcon icon={Tick01Icon} size={16} />
                      ) : skipped ? (
                        "—"
                      ) : (
                        String(value).padStart(2, "0")
                      )}
                    </span>
                    <span>{label}</span>
                  </Button>
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="min-w-0" key={step}>
          <div className="mb-[26px] flex items-center justify-between gap-6 max-md:mb-5 max-md:flex-wrap max-md:gap-3">
            <div>
              {step === 3 && (
                <p className={cn(eyebrow, "mb-3")}>YOUR PERFECT MATCH</p>
              )}
              <h3
                id={questionId}
                ref={heading}
                tabIndex={-1}
                className="scroll-mt-[145px] text-[clamp(22px,2.1vw,30px)] font-[550] leading-[1.45] tracking-[-0.8px] outline-none max-md:scroll-mt-[105px] max-md:text-[22px] max-md:tracking-[-0.7px]"
              >
                {question}
              </h3>
              {step === 3 && (
                <p className="mt-3 text-[13px] leading-[1.8] text-[#ccd3c8] max-md:text-xs max-md:leading-[1.7]">
                  {config.resultSub}
                </p>
              )}
            </div>
            {step > 1 && (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "inline-flex h-auto min-h-11 shrink-0 items-center gap-2.5 rounded-none border-0 bg-transparent px-0 py-2 text-xs text-[#dbe1d9] hover:bg-transparent hover:text-[#ffac7c] max-md:min-h-[34px] max-md:text-[11px]",
                  focusRing
                )}
                onClick={() => setStep(1)}
              >
                선택 바꾸기
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </Button>
            )}
          </div>
          {step === 1 && (
            <div
              className="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-md:gap-3"
              aria-labelledby={questionId}
            >
              {config.scenes.map((item, index) => (
                <Button
                  type="button"
                  variant="ghost"
                  key={item.id}
                  onClick={() => chooseScene(item.id)}
                  className={cn(
                    "group/finder-scene relative isolate block aspect-[0.92] h-auto w-full overflow-hidden whitespace-normal rounded-lg border border-[#596358] bg-[#28392d] p-0 text-left text-[#f8f7f2] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[linear-gradient(180deg,#111a1430_0%,#10191200_22%,#101912e8_100%)] hover:border-[#ff8a4b] hover:bg-[#28392d] hover:text-[#f8f7f2] focus-visible:border-[#ff8a4b] max-md:aspect-[0.82] max-md:rounded-md",
                    focusRing
                  )}
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 46vw, 24vw"
                      loading="lazy"
                      className="-z-20 object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/finder-scene:scale-[1.055] motion-safe:group-focus-visible/finder-scene:scale-[1.055]"
                    />
                  )}
                  <span
                    className="absolute left-[18px] top-[18px] font-sans text-[11px] tracking-[0.05em] max-md:left-[13px] max-md:top-[13px] max-md:text-[10px]"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <span className="absolute inset-x-5 bottom-[21px] block pr-7 max-lg:inset-x-4 max-md:inset-x-3.5 max-md:bottom-4 max-md:pr-0">
                    <strong className="block text-xl font-semibold tracking-[-0.5px] max-lg:text-[17px] max-md:text-base max-md:tracking-[-0.4px]">
                      {item.title}
                    </strong>
                    {item.desc && (
                      <small className="mt-[9px] block max-w-[180px] text-[11px] font-normal leading-[1.7] text-[#e0e5dc] max-lg:text-[10px] max-md:mt-2 max-md:leading-[1.6]">
                        {item.desc}
                      </small>
                    )}
                    <span
                      className="absolute -right-[3px] top-0 grid size-8 place-items-center rounded-full border border-[#a1ada2] transition-colors group-hover/finder-scene:border-[#ff7a32] group-hover/finder-scene:bg-[#ff7a32] group-hover/finder-scene:text-[#18201b] group-focus-visible/finder-scene:border-[#ff7a32] group-focus-visible/finder-scene:bg-[#ff7a32] group-focus-visible/finder-scene:text-[#18201b] motion-reduce:transition-none max-md:bottom-0 max-md:right-0 max-md:top-auto max-md:size-6 max-md:-translate-y-[82px]"
                      aria-hidden="true"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={20}
                        className="max-md:size-3.5"
                      />
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-[minmax(230px,0.8fr)_minmax(0,2fr)] gap-7 max-lg:grid-cols-[minmax(200px,0.8fr)_minmax(0,1.6fr)] max-lg:gap-5 max-md:block">
              <div className="relative isolate min-h-[345px] overflow-hidden rounded-lg bg-[#2a382d] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[linear-gradient(180deg,#111a1430_0%,#10191200_22%,#101912e8_100%)] max-md:mb-[18px] max-md:h-[88px] max-md:min-h-0 max-md:border max-md:border-[#58665a] max-md:bg-[#26382a] max-md:after:hidden">
                <div className="absolute inset-0 -z-20 max-md:w-[88px]">
                  {selectedScene?.image && (
                    <Image
                      src={selectedScene.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 100px, 28vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="absolute inset-x-6 bottom-[23px] text-2xl font-[550] tracking-[-0.8px] max-md:static max-md:ml-[108px] max-md:flex max-md:min-h-[88px] max-md:items-center max-md:pr-[18px] max-md:text-[19px]">
                  {selectedScene?.title}
                </span>
              </div>
              <div className="min-w-0">
                <ToggleGroup
                  value={focus ? [focus] : []}
                  onValueChange={(values) => setFocus(values[0] ?? "")}
                  className="grid w-full grid-cols-1 gap-3 rounded-none"
                  orientation="vertical"
                  multiple={false}
                  aria-labelledby={questionId}
                >
                  {branch.options.map((option, index) => {
                    const selected = option.id === focus
                    return (
                      <ToggleGroupItem
                        key={option.id}
                        value={option.id}
                        className={cn(
                          "relative grid h-auto min-h-[86px] w-full grid-cols-[28px_1fr_26px] items-center gap-[15px] whitespace-normal rounded-md border border-[#677268] bg-[#243027] px-6 py-[18px] text-left text-[#f8f7f2] transition-colors hover:border-[#afbaa8] hover:bg-[#344236] hover:text-white motion-reduce:transition-none max-md:min-h-[88px] max-md:grid-cols-[22px_1fr_24px] max-md:gap-2.5 max-md:px-[15px] max-md:py-[17px]",
                          selected &&
                            "border-[#ff8a4b] bg-[#f7f5ee] text-[#19221c] hover:border-[#ff8a4b] hover:bg-[#f7f5ee] hover:text-[#19221c]"
                        )}
                      >
                        <span
                          className={cn(
                            "font-sans text-[11px] text-[#acb9ad]",
                            selected && "text-[#825136]"
                          )}
                        >
                          0{index + 1}
                        </span>
                        <strong className="text-base font-medium leading-[1.6] max-md:text-sm">
                          {option.label}
                        </strong>
                        <span
                          className={cn(
                            "grid size-[25px] place-items-center rounded-full border border-[#839383]",
                            selected &&
                              "border-[#ff7a32] bg-[#ff7a32] text-[#172018]"
                          )}
                          aria-hidden="true"
                        >
                          <HugeiconsIcon
                            icon={Tick01Icon}
                            size={17}
                            className={selected ? "opacity-100" : "opacity-0"}
                          />
                        </span>
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
                <div className="mt-[22px] flex flex-wrap items-center justify-end gap-3 max-md:grid max-md:grid-cols-[auto_1fr] max-md:justify-start max-md:gap-2.5">
                  <Button
                    variant="outline"
                    className={secondaryAction}
                    onClick={() => setStep(1)}
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      data-icon="inline-start"
                    />
                    이전
                  </Button>
                  <Button
                    className={primaryAction}
                    disabled={!focus}
                    onClick={() => setStep(3)}
                  >
                    추천 제품 보기
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      data-icon="inline-end"
                    />
                  </Button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div aria-labelledby={questionId}>
              <p className="mb-[22px] flex flex-wrap items-baseline gap-x-[18px] gap-y-2 text-xs leading-[1.7] text-[#d6ded1] max-md:mb-[18px] max-md:grid max-md:gap-[5px] max-md:text-[11px]">
                <span>{selectedScene?.title}</span>
                {selectedOption && (
                  <span className="border-l border-[#6c7b6a] pl-[18px] max-md:border-0 max-md:pl-0">
                    {selectedOption.label}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] justify-items-center gap-5 max-md:grid-cols-1 max-md:gap-3.5">
                {recommended.map((product) => (
                  <LocalizedClientLink
                    key={product.id}
                    href={"/products/" + product.handle}
                    className={cn(
                      "group/finder-result grid w-full min-w-0 max-w-[720px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-6 rounded-lg border border-[#e3e0d6] bg-[#f7f5ef] p-6 text-[#172019] transition-[transform,border-color,background-color] duration-200 hover:border-[#ff8a4b] hover:bg-white focus-visible:border-[#ff8a4b] focus-visible:bg-white motion-safe:hover:-translate-y-[3px] motion-safe:focus-visible:-translate-y-[3px] motion-reduce:transition-none max-lg:gap-[18px] max-lg:p-5 max-md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] max-md:gap-[17px] max-md:p-[17px]",
                      focusRing
                    )}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded bg-[#eeece6]">
                      {product.thumbnail && (
                        <Image
                          src={product.thumbnail}
                          alt=""
                          width={340}
                          height={340}
                          loading="lazy"
                          className="block h-full w-full object-contain mix-blend-multiply motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/finder-result:scale-[1.04]"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[clamp(20px,2vw,28px)] font-[650] leading-[1.4] tracking-[-0.7px] max-md:text-[21px]">
                        {product.title}
                      </h4>
                      <strong className="mb-6 mt-[15px] block text-lg font-[550] max-md:mb-3.5 max-md:mt-[11px] max-md:text-base">
                        {
                          getProductPrice({ product }).cheapestPrice
                            ?.calculated_price
                        }
                      </strong>
                      <span className="flex items-center justify-between gap-3 border-t border-[#d4d5cc] pt-[15px] text-xs text-[#7f350f] max-md:pt-3 max-md:text-[10px]">
                        제품 알아보기
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                      </span>
                    </div>
                  </LocalizedClientLink>
                ))}
              </div>
              <div className="mt-[22px] flex flex-wrap items-center justify-end gap-3 max-md:justify-start max-md:gap-2.5">
                {recommended.length > 1 && (
                  <LocalizedClientLink
                    className={buttonVariants({ className: primaryAction })}
                    href={
                      "/compare?products=" +
                      recommended.map((product) => product.handle).join(",")
                    }
                  >
                    추천 제품 비교하기
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </LocalizedClientLink>
                )}
                {!branch.skip && (
                  <Button
                    variant="outline"
                    className={secondaryAction}
                    onClick={() => setStep(2)}
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      data-icon="inline-start"
                    />
                    이전
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={secondaryAction}
                  onClick={reset}
                >
                  <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
                  다시 찾기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
