"use client"

import type { HttpTypes } from "@medusajs/types"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@modules/common/components/ui/tabs"
import ProductRail from "./product-rail"
import home from "@/content/home.json"

export default function FeaturedProducts({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) {
  return (
    <section className="home-lineup content-container" id="collection">
      <Tabs defaultValue={home.lineup[0].id}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">MADE FOR YOUR WORLD</p>
            <h2>
              당신의 순간에,
              <br />
              당신의 샥즈.
            </h2>
          </div>
          <TabsList aria-label="제품 라인업">
            {home.lineup.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {home.lineup.map((tab) => (
          <TabsContent value={tab.id} key={tab.id}>
            <ProductRail products={products} cards={tab.cards} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
