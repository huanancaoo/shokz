import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  GitCompareIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import { SelectControl } from "@modules/common/components/ui/select-control"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@modules/common/components/ui/input-group"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { searchCatalog } from "@lib/data/search"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { FilterDisclosure } from "@modules/store/components/filter-disclosure"

export type CatalogParams = {
  q?: string
  category?: string
  feature?: string
  max?: string
  sort?: string
  page?: string
}

export default async function Catalog({
  countryCode,
  filters,
  categoryHandle,
}: {
  countryCode: string
  filters: CatalogParams
  categoryHandle?: string
}) {
  const categories = await listCategories()
  const selectedCategory = categories.find(
    (item) => item.handle === categoryHandle || item.id === filters.category
  )
  const page = Math.max(1, Number(filters.page) || 1)
  const {
    products: visible,
    count,
    features,
  } = await searchCatalog({
    countryCode,
    ...filters,
    category: selectedCategory?.name,
    page,
  })
  const pages = Math.ceil(count / 12)
  const title = filters.q
    ? `“${filters.q}” 검색 결과`
    : selectedCategory?.name || "모든 샥즈를 만나보세요."
  const fields = [
    {
      name: "feature",
      label: "기능",
      items: [
        { value: "", label: "모든 기능" },
        ...features.map((feature) => ({ value: feature, label: feature })),
      ],
    },
    {
      name: "max",
      label: "가격",
      items: [
        { value: "", label: "모든 가격" },
        { value: "100000", label: "10만원 이하" },
        { value: "200000", label: "20만원 이하" },
        { value: "300000", label: "30만원 이하" },
      ],
    },
    {
      name: "sort",
      label: "정렬",
      items: [
        { value: "", label: "추천순" },
        { value: "price_asc", label: "낮은 가격순" },
        { value: "price_desc", label: "높은 가격순" },
      ],
    },
  ] as const

  return (
    <div className="catalog-page content-container">
      <div className="catalog-intro">
        <p className="eyebrow">THE OPEN-EAR COLLECTION</p>
        <h1>{title}</h1>
        <p>당신의 움직임과 일상에 어울리는 사운드를 찾아보세요.</p>
      </div>
      <div className="category-pills">
        <LocalizedClientLink
          href="/store"
          className={!selectedCategory ? "active" : ""}
        >
          전체 제품
        </LocalizedClientLink>
        {categories.map((category) => (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle}`}
            className={selectedCategory?.id === category.id ? "active" : ""}
          >
            {category.name}
          </LocalizedClientLink>
        ))}
      </div>
      <form method="get" className="catalog-filters">
        <InputGroup className="catalog-search h-12">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="제품 검색"
            aria-label="제품 검색"
          />
        </InputGroup>
        <FilterDisclosure>
          <div className="filter-fields">
            {fields.map(({ name, label, items }) => (
              <Field
                key={name}
                className="min-w-0 max-w-[180px] max-md:max-w-[140px]"
              >
                <FieldLabel htmlFor={`catalog-${name}`}>{label}</FieldLabel>
                <SelectControl
                  id={`catalog-${name}`}
                  name={name}
                  items={items}
                  defaultValue={filters[name] ?? ""}
                />
              </Field>
            ))}
          </div>
        </FilterDisclosure>
        <Button type="submit" size="lg">
          적용
        </Button>
      </form>
      <div className="catalog-count">
        <span>
          <b>{count}</b>개의 제품
        </span>
        <LocalizedClientLink
          href={categoryHandle ? `/categories/${categoryHandle}` : "/store"}
        >
          필터 초기화
        </LocalizedClientLink>
      </div>
      <div className="shokz-grid" data-testid="products-list">
        {visible.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-catalog">
          <HugeiconsIcon icon={Search01Icon} width="36" height="36" />
          <h2>조건에 맞는 제품이 없습니다.</h2>
          <p>검색어 또는 필터를 변경해 보세요.</p>
          <LocalizedClientLink href="/store" className={buttonVariants()}>
            전체 제품 보기
          </LocalizedClientLink>
        </div>
      )}
      {pages > 1 && (
        <nav className="catalog-pagination" aria-label="상품 페이지">
          {Array.from({ length: pages }, (_, index) => (
            <a
              key={index}
              href={`?${new URLSearchParams({
                ...filters,
                page: String(index + 1),
              })}`}
              aria-current={page === index + 1 ? "page" : undefined}
            >
              {index + 1}
            </a>
          ))}
        </nav>
      )}
      <div className="catalog-bottom">
        <HugeiconsIcon icon={GitCompareIcon} />
        <div>
          <h2>나에게 맞는 제품을 찾고 있나요?</h2>
          <p>제품의 비교하기를 선택하고 차이를 확인하세요.</p>
        </div>
        <LocalizedClientLink href="/compare" className="text-link">
          제품 비교하기 <HugeiconsIcon icon={ArrowRight01Icon} />
        </LocalizedClientLink>
      </div>
    </div>
  )
}
