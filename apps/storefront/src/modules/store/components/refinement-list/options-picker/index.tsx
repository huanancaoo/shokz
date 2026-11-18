"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@modules/common/components/ui/accordion"
import { Toggle } from "@modules/common/components/ui/toggle"
import { useEffect, useState } from "react"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: {
            is_exclusive: false,
            fields: "*values",
          },
        })

        if (response?.product_options) {
          setOptions(response.product_options)
        }
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">
          Options
        </span>
      </div>
      <Accordion
        multiple
        value={openItems}
        onValueChange={(values) => setOpenItems(values as string[])}
        className="flex flex-col gap-y-3 pr-6"
      >
        {options.map((option) => {
          const values =
            option.values
              ?.map((value) => ({
                id: value.id,
                label: value.value,
              }))
              .filter(
                (value): value is { id: string; label: string } =>
                  !!value.id && !!value.label
              ) || []

          if (!values.length) {
            return null
          }

          const toggleValue = (valueId: string) => {
            const isSelected = selectedValueIds.includes(valueId)
            const nextSelections = isSelected
              ? selectedValueIds.filter((id) => id !== valueId)
              : [...selectedValueIds, valueId]

            setOptionValueIds(Array.from(new Set(nextSelections)))
          }

          const isOpen = openItems.includes(option.id)
          const selectedCount = values.filter((value) =>
            selectedValueIds.includes(value.id)
          ).length

          return (
            <AccordionItem
              key={option.id}
              value={option.id}
              className="overflow-hidden"
            >
              <AccordionTrigger className="flex w-full items-center justify-between py-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {option.title || "Option"}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    ({selectedCount})
                  </span>
                </div>
                <span
                  className={clsx(
                    "flex h-7 w-7 items-center justify-center text-muted-foreground transition-transform duration-150",
                    {
                      "rotate-180": isOpen,
                    }
                  )}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} />
                </span>
              </AccordionTrigger>

              <AccordionContent className="pb-4 pt-1">
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedValueIds.includes(value.id)

                    return (
                      <Toggle
                        key={value.id}
                        variant="outline"
                        pressed={isSelected}
                        onPressedChange={() => toggleValue(value.id)}
                        className={clsx(
                          "border-border border text-small-regular h-10 rounded-rounded px-3 flex items-center transition-colors duration-150",
                          {
                            "border-primary text-foreground": isSelected,
                            "text-muted-foreground hover:text-foreground":
                              !isSelected,
                          }
                        )}
                      >
                        {value.label}
                      </Toggle>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export default OptionsPicker
