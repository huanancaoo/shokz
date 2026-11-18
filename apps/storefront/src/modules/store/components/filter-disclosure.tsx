"use client"

import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@lib/utils"
import { Button } from "@modules/common/components/ui/button"
import { useId, useState, type ReactNode } from "react"

export function FilterDisclosure({ children }: { children: ReactNode }) {
  const id = useId()
  const [open, setOpen] = useState(true)

  return (
    <div className="min-w-0 max-md:flex-1">
      <Button
        type="button"
        variant="ghost"
        className="h-11 w-full justify-between px-0 md:hidden"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      >
        필터 및 정렬
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>
      <div id={id} className={cn("md:block", !open && "hidden")}>
        {children}
      </div>
    </div>
  )
}
