import { cn as clx } from "@lib/utils"
import { Button } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import { Label } from "@modules/common/components/ui/label"

type SearchFormProps = {
  countryCode: string
  defaultValue?: string
  className?: string
}

/** Plain GET form so search works without JavaScript and for browser agents. */
const SearchForm = ({
  countryCode,
  defaultValue,
  className,
}: SearchFormProps) => (
  <form
    role="search"
    method="get"
    action={`/${countryCode}/search`}
    className={clx("flex gap-2", className)}
    {...{
      toolname: "search_products",
      tooldescription: "Search the store's products by keyword",
    }}
  >
    <Label htmlFor="search-q" className="sr-only">
      Search products
    </Label>
    <Input
      id="search-q"
      type="search"
      name="q"
      defaultValue={defaultValue}
      placeholder="Search products"
      className="flex-1 h-10 px-4 border rounded-md border-border bg-background text-sm"
    />
    <Button
      type="submit"
      className="h-[46px] px-4 rounded-md bg-black text-white hover:bg-gray-800"
    >
      Search
    </Button>
  </form>
)

export default SearchForm
