"use client"

import { useState } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PlayIcon,
  ZoomInAreaIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@modules/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@modules/common/components/ui/dialog"

export default function ImageGallery({
  images,
  video,
}: {
  images: { id: string; url: string }[]
  video?: string
}) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const total = images.length + (video ? 1 : 0)
  const showingVideo = Boolean(video && active === images.length)
  const navigate = (direction: number) =>
    setActive((index) => (index + direction + total) % total)

  return (
    <div className="product-gallery-widget">
      <div className="product-gallery-main">
        {showingVideo ? (
          video!.includes("youtube.com/embed/") ? (
            <iframe
              src={video}
              title="제품 소개 영상"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video}
              controls
              playsInline
              poster={images[0]?.url}
              aria-label="제품 소개 영상"
            />
          )
        ) : (
          images[active] && (
            <Image
              src={images[active].url}
              alt={"제품 이미지 " + (active + 1)}
              fill
              loading="eager"
              quality={90}
              sizes="(max-width: 767px) 100vw, 48vw"
            />
          )
        )}
        {!showingVideo && (
          <>
            <Button
              variant="ghost"
              className="gallery-zoom-target"
              aria-label="제품 이미지 크게 보기"
              onClick={() => setZoom(true)}
            >
              <HugeiconsIcon icon={ZoomInAreaIcon} />
            </Button>
            {total > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="gallery-previous"
                  aria-label="이전 제품 이미지"
                  onClick={() => navigate(-1)}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="gallery-next"
                  aria-label="다음 제품 이미지"
                  onClick={() => navigate(1)}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                </Button>
              </>
            )}
            <span className="gallery-counter">
              {active + 1} / {total}
            </span>
          </>
        )}
      </div>
      <div className="gallery-thumbs">
        {images.map((image, index) => (
          <Button
            variant="ghost"
            type="button"
            key={image.id}
            onClick={() => setActive(index)}
            aria-label={"제품 이미지 " + (index + 1) + " 보기"}
            aria-current={active === index}
          >
            <Image src={image.url} alt="" fill loading="lazy" sizes="70px" />
          </Button>
        ))}
        {video && (
          <Button
            variant="outline"
            type="button"
            className="gallery-video-thumb"
            onClick={() => setActive(images.length)}
            aria-current={showingVideo}
          >
            <HugeiconsIcon icon={PlayIcon} />
            <span>영상 보기</span>
          </Button>
        )}
      </div>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="product-image-dialog">
          <DialogHeader>
            <DialogTitle>
              제품 이미지 {active + 1} / {images.length}
            </DialogTitle>
          </DialogHeader>
          <div className="product-image-expanded">
            {images[active] && (
              <Image
                src={images[active].url}
                fill
                quality={90}
                sizes="90vw"
                alt={"확대 제품 이미지 " + (active + 1)}
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setActive((active - 1 + images.length) % images.length)
                }
                aria-label="이전 제품 이미지"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
                이전
              </Button>
              <Button
                variant="outline"
                onClick={() => setActive((active + 1) % images.length)}
                aria-label="다음 제품 이미지"
              >
                다음
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
