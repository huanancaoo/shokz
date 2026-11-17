"use client"

import type { HttpTypes } from "@medusajs/types"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
} from "@modules/common/components/ui/tabs"
import ProductRail from "./product-rail"
import home from "@/content/home.json"

export default function FeaturedProducts({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) {
  return (
    <section
      className="content-container scroll-mt-[110px] py-16 md:py-24"
      id="collection"
      aria-labelledby="lineup-title"
    >
      <Tabs className="block" defaultValue={home.lineup[0].id}>
        <div
          className="mb-8 flex flex-col gap-7 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-10"
          data-reveal
        >
          <div className="max-w-[540px]">
            <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a1400c] md:text-[11px]">
              MADE FOR YOUR WORLD
            </p>
            <h2
              className="text-[32px] font-semibold leading-[1.35] tracking-[-0.045em] md:text-[46px]"
              id="lineup-title"
            >
              당신의 순간에, 당신의 샥즈.
            </h2>
          </div>
          {/* 轨道随 44px 选项加上下各 4px 内边距定高，清除共享组件的 32px 高度。 */}
          <TabsList
            className="relative isolate flex min-h-[52px] w-full shrink-0 items-center justify-start gap-0 overflow-x-auto rounded-full bg-[#f1efeb] p-1 group-data-[orientation=horizontal]/tabs:h-auto [scrollbar-width:none] md:w-auto [&::-webkit-scrollbar]:hidden"
            aria-label="제품 라인업"
          >
            <TabsIndicator
              className="z-0 rounded-full bg-[#171717] shadow-[0_4px_12px_#00000014]"
              renderBeforeHydration
            />
            {home.lineup.map((tab) => (
              <TabsTrigger
                className="group relative z-10 h-11 min-w-0 flex-1 rounded-full border-0 bg-transparent px-2 py-0 text-[11px] font-medium text-[#66615a] transition-[color,background-color] duration-300 after:hidden hover:bg-[#e6e3dd] hover:text-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#ff6008] focus-visible:ring-0 data-[active]:bg-transparent data-[active]:text-white data-[active]:hover:bg-transparent data-[active]:hover:text-white group-data-[variant=default]/tabs-list:data-[active]:shadow-none motion-reduce:transition-none md:min-w-[80px] md:flex-none md:px-6 md:text-xs"
                key={tab.id}
                value={tab.id}
              >
                <span className="transition-transform duration-200 group-hover:scale-[1.025] motion-reduce:transition-none">
                  {tab.name}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {home.lineup.map((tab) => (
          <TabsContent
            className="outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6008]"
            value={tab.id}
            key={tab.id}
          >
            <ProductRail products={products} cards={tab.cards} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
