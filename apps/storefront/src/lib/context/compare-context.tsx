"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname, useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Checkbox } from "@modules/common/components/ui/checkbox"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { useId } from "react"

type Comparison = {
  handles: string[]
  toggle: (handle: string) => void
  replace: (handles: string[]) => void
}
const CompareContext = createContext<Comparison | null>(null)
export const useCompare = () => useContext(CompareContext)!

export default function CompareProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [handles, setHandles] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    const stored = localStorage.getItem("shokz-compare")
    if (stored) setHandles(JSON.parse(stored))
  }, [])
  const replace = useCallback(
    (next: string[]) => {
      setHandles(next)
      localStorage.setItem("shokz-compare", JSON.stringify(next))
      if (pathname.endsWith("/compare")) {
        const params = new URLSearchParams(window.location.search)
        if ((params.get("products") ?? "") !== next.join(",")) {
          if (next.length) params.set("products", next.join(","))
          else params.delete("products")
          const query = params.toString()
          router.replace(pathname + (query ? "?" + query : ""), {
            scroll: false,
          })
        }
      }
    },
    [pathname, router]
  )
  const toggle = (handle: string) => {
    if (!handles.includes(handle) && handles.length === 3) {
      return
    }
    replace(
      handles.includes(handle)
        ? handles.filter((item) => item !== handle)
        : [...handles, handle]
    )
  }
  return (
    <CompareContext.Provider value={{ handles, toggle, replace }}>
      {children}
    </CompareContext.Provider>
  )
}

export function CompareToggle({
  handle,
  showLink = false,
}: {
  handle: string
  showLink?: boolean
}) {
  const { handles, toggle } = useCompare()
  const id = useId()
  const { countryCode = "kr" } = useParams()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Field orientation="horizontal" className="compare-toggle">
        <Checkbox
          id={id}
          checked={handles.includes(handle)}
          disabled={handles.length === 3 && !handles.includes(handle)}
          onCheckedChange={() => toggle(handle)}
        />
        <FieldLabel htmlFor={id}>비교하기</FieldLabel>
      </Field>
      {showLink && handles.length > 0 && (
        <Link
          href={"/" + countryCode + "/compare?products=" + handles.join(",")}
          className="text-link text-xs"
        >
          비교표 보기 ({handles.length})
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </Link>
      )}
    </div>
  )
}
