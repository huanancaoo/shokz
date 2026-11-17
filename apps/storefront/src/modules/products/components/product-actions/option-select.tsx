"use client"

import type { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon } from "@hugeicons/core-free-icons"
import { Button } from "@modules/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@modules/common/components/ui/dialog"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@modules/common/components/ui/toggle-group"
import { FieldSet, FieldLegend } from "@modules/common/components/ui/field"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  name: string
  disabled: boolean
  availableValues: string[]
  variantValues: string[]
  sizeGuideVideo?: string | null
  "data-testid"?: string
}

export default function OptionSelect({
  option,
  current,
  updateOption,
  title,
  name,
  disabled,
  availableValues,
  variantValues,
  sizeGuideVideo,
  "data-testid": testId,
}: OptionSelectProps) {
  const [guideOpen, setGuideOpen] = useState(false)
  return (
    <FieldSet disabled={disabled} className="product-option-set">
      <FieldLegend>
        {title} <span className="text-muted-foreground">{current}</span>
      </FieldLegend>
      {sizeGuideVideo && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="size-guide-button"
          onClick={() => setGuideOpen(true)}
        >
          <HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
          나에게 맞는 사이즈 찾기
        </Button>
      )}
      <ToggleGroup
        value={current ? [current] : []}
        onValueChange={(values) => {
          if (values[0]) updateOption(option.id, values[0])
        }}
        variant="outline"
        disabled={disabled}
        aria-label={title + " 선택"}
        data-testid={testId}
        className="product-option-values"
      >
        {option.values
          ?.filter(({ value }) => variantValues.includes(value))
          .map(({ value }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              disabled={!availableValues.includes(value)}
              data-testid="option-button"
              aria-label={value}
            >
              {value}
            </ToggleGroupItem>
          ))}
      </ToggleGroup>
      <input type="hidden" name={name} value={current ?? ""} />
      {sizeGuideVideo && (
        <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
          <DialogContent className="size-guide-dialog">
            <DialogHeader>
              <DialogTitle>나에게 맞는 사이즈 찾기</DialogTitle>
            </DialogHeader>
            <iframe
              src={sizeGuideVideo}
              title="사이즈 가이드 영상"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </DialogContent>
        </Dialog>
      )}
    </FieldSet>
  )
}
