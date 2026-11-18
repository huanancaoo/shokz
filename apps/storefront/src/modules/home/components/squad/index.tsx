"use client"

import { useRef, useState } from "react"
import Image from "@modules/common/components/store-image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@lib/utils"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@modules/common/components/ui/tabs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import home from "@/content/home.json"

export default function Squad() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const tabList = useRef<HTMLDivElement>(null)

  function select(index: number) {
    setActive(index)
    const list = tabList.current!
    const bounds = list.getBoundingClientRect()
    const tab = tabs.current[index]!.getBoundingClientRect()
    if (tab.left >= bounds.left && tab.right <= bounds.right) return
    // 只在横向轨道中按 snap-start 对齐，避免裁切选项或带动整页纵向滚动。
    list.scrollTo({
      left: list.scrollLeft + tab.left - bounds.left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }

  return (
    <section
      className="scroll-mt-[90px] bg-[#151a1d] text-white md:scroll-mt-[110px]"
      id="squad"
      aria-label="샥즈 스쿼드"
    >
      {/* 退场面板会延后一帧卸载；共用网格单元，避免两个面板短暂撑高页面。 */}
      <Tabs
        className="grid grid-cols-[minmax(0,1fr)] gap-0"
        value={home.athletes[active].id}
        onValueChange={(value) =>
          select(home.athletes.findIndex((item) => item.id === value))
        }
      >
        {home.athletes.map((athlete, index) => (
          <TabsContent
            className="relative col-start-1 row-start-1 isolate min-h-[590px] min-w-0 outline-offset-[-4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6008] md:min-h-[clamp(560px,45vw,730px)]"
            value={athlete.id}
            key={athlete.id}
            tabIndex={0}
          >
            <div className="absolute inset-0 -z-20 overflow-hidden bg-[#20272d] motion-safe:animate-[campaign-enter_650ms_cubic-bezier(0.22,1,0.36,1)]">
              <Image
                className="h-full w-full object-cover object-[65%_center] md:object-[58%_center]"
                src={athlete.image}
                alt={athlete.name + " " + athlete.role}
                fill
                sizes="100vw"
                quality={90}
                loading="lazy"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#11171b35_0%,#11171b00_30%,#11171bb5_67%,#11171bf2_100%)] md:bg-[linear-gradient(90deg,#11171bf2_0%,#11171ba8_30%,#11171b10_70%)]"
              aria-hidden="true"
            />
            <div className="content-container relative flex min-h-[inherit] items-end justify-between py-[34px] md:items-center md:py-20">
              <div className="w-full max-w-[470px] motion-safe:animate-fade-in-right md:w-[46%] md:max-w-[610px]">
                <p className="mb-[18px] text-[10px] font-semibold tracking-[0.2em] text-white md:mb-[30px] md:text-[11px]">
                  THE SHOKZ SQUAD
                </p>
                <h2 className="max-w-full text-[clamp(43px,12vw,64px)] font-semibold leading-[1.13] tracking-[-0.05em] md:text-[clamp(48px,5.8vw,88px)]">
                  {athlete.name}
                </h2>
                <p className="mt-[13px] text-xs leading-[1.8] text-[#e1e3e5] md:mt-[22px] md:text-[15px]">
                  {athlete.role}
                </p>
                <LocalizedClientLink
                  className="group mt-[22px] inline-flex items-center gap-[18px] py-[3px] text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-[#ff813f] md:mt-[38px] md:gap-[26px] md:text-[13px]"
                  href={
                    athlete.group === "ambassador"
                      ? "/pages/ambassador"
                      : "/pages/athletes"
                  }
                >
                  스토리 알아보기
                  <span
                    className="grid h-[42px] w-[42px] place-items-center rounded-full bg-[#ff6008] text-[#171717] transition-[transform,background-color] duration-200 group-hover:translate-x-[5px] group-hover:bg-[#ff813f] group-focus-visible:translate-x-[5px] group-focus-visible:bg-[#ff813f] motion-reduce:transition-none md:h-[46px] md:w-[46px]"
                    aria-hidden="true"
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={21} />
                  </span>
                </LocalizedClientLink>
              </div>
              <span
                className="absolute right-5 top-[25px] font-[Arial,sans-serif] text-[25px] tabular-nums tracking-[-0.04em] md:static md:self-start md:text-[31px]"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
                <small className="text-[11px] tracking-normal text-[#dadde1] md:text-[13px]">
                  {" "}
                  / {String(home.athletes.length).padStart(2, "0")}
                </small>
              </span>
            </div>
          </TabsContent>
        ))}
        <div className="content-container col-start-1 row-start-2 min-w-0 border-t border-[#353b40] bg-[#151a1d]">
          {/* 覆盖组件相同的高度修饰符，保证头像和姓名不被默认 32px 轨道裁切。 */}
          <TabsList
            ref={tabList}
            className="-mr-5 grid h-auto w-auto min-w-0 auto-cols-[158px] grid-flow-col items-stretch justify-start gap-0 overflow-x-auto overscroll-x-contain scroll-smooth rounded-none bg-[#151a1d] py-1 pl-0 pr-5 group-data-[orientation=horizontal]/tabs:h-auto [scroll-snap-type:x_proximity] [scrollbar-width:none] motion-reduce:scroll-auto md:mr-0 md:auto-cols-[175px] md:pr-0 xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-7 xl:overflow-visible [&::-webkit-scrollbar]:hidden"
            aria-label="샥즈 스쿼드"
          >
            {home.athletes.map((item, index) => (
              <TabsTrigger
                className="group relative flex h-auto min-h-[94px] min-w-0 flex-none snap-start items-center justify-start gap-[10px] rounded-none border-0 border-t-2 border-transparent bg-[#151a1d] px-3 py-4 text-left text-[#c1c6cc] transition-[color,background-color,border-color] duration-200 after:hidden hover:bg-[#232a30] hover:text-white focus-visible:z-10 focus-visible:border-[#ff813f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#ff813f] focus-visible:ring-0 data-[active]:border-t-[#ff6008] data-[active]:bg-[#232a30] data-[active]:text-white group-data-[variant=default]/tabs-list:data-[active]:shadow-none motion-reduce:transition-none md:min-h-[104px] md:gap-3 md:py-[18px] [&+button]:border-l [&+button]:border-l-[#2c3237]"
                value={item.id}
                key={item.id}
                ref={(element) => {
                  tabs.current[index] = element
                }}
                aria-label={item.name}
              >
                <Image
                  className={cn(
                    "h-12 w-[38px] shrink-0 rounded-[3px] bg-[#30373d] object-cover object-top transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none md:h-[54px] md:w-11",
                    active === index ? "opacity-100" : "opacity-70"
                  )}
                  src={item.avatar}
                  alt=""
                  width={48}
                  height={56}
                  loading="lazy"
                />
                <span className="grid min-w-0 gap-[7px]">
                  <strong className="whitespace-normal break-keep text-[11px] font-medium leading-[1.45] md:text-xs">
                    {item.name}
                  </strong>
                  <small className="text-[9px] leading-[1.45] text-[#9fa6ad]">
                    {item.group === "ambassador" ? "앰버서더" : "애슬리트"}
                  </small>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </section>
  )
}
