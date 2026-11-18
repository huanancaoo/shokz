"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import Image from "@modules/common/components/store-image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PlayIcon,
  ZoomInAreaIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@modules/common/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@modules/common/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@modules/common/components/ui/dialog"

const thumbnailClassName =
  "relative aspect-square h-auto min-w-0 w-full rounded-lg border border-border bg-[var(--shokz-soft)] p-1 transition-colors hover:border-foreground/40 hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:ring-1 aria-[current=true]:ring-inset aria-[current=true]:ring-primary focus-visible:ring-inset motion-reduce:transition-none"

export default function ImageGallery({
  images,
  video,
}: {
  images: { id: string; url: string }[]
  video?: string
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [thumbnailsApi, setThumbnailsApi] = useState<CarouselApi>()
  const [zoom, setZoom] = useState(false)
  const zoomButtonsRef = useRef<(HTMLButtonElement | null)[]>([])
  const galleryId = useId()
  const total = images.length + (video ? 1 : 0)
  const subscribe = useCallback(
    (update: () => void) => {
      if (!api) return () => {}
      api.on("select", update)
      api.on("reInit", update)
      return () => {
        api.off("select", update)
        api.off("reInit", update)
      }
    },
    [api]
  )
  // 主图、缩略图和放大视图共用轮播的选中项，滑动后不会出现状态不同步。
  const active = useSyncExternalStore(
    subscribe,
    () => api?.selectedScrollSnap() ?? 0,
    () => 0
  )
  const showingVideo = Boolean(video && active === images.length)
  const select = (index: number) =>
    api?.scrollTo(
      index,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )

  useEffect(() => {
    if (!thumbnailsApi) return
    // 缩略图单独浏览；只有主图切换或尺寸变化时，才重新显示当前选中的图片。
    const showActiveThumbnail = () =>
      thumbnailsApi.scrollTo(
        active,
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    showActiveThumbnail()
    thumbnailsApi.on("reInit", showActiveThumbnail)
    return () => {
      thumbnailsApi.off("reInit", showActiveThumbnail)
    }
  }, [active, thumbnailsApi])

  return (
    <div className="product-gallery-widget min-w-0 space-y-3">
      <Carousel
        setApi={setApi}
        opts={{
          loop: total > 1,
          duration: 24,
          breakpoints: {
            "(prefers-reduced-motion: reduce)": { duration: 0 },
          },
        }}
        id={galleryId}
        aria-label="제품 갤러리"
        tabIndex={total > 1 ? 0 : undefined}
        className="overflow-hidden rounded-2xl bg-[var(--shokz-soft)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:rounded-3xl"
      >
        <CarouselContent className="ml-0 touch-pan-y touch-pinch-zoom">
          {images.map((image, index) => (
            <CarouselItem
              key={image.id}
              className="relative aspect-square pl-0"
              aria-label={`${index + 1} / ${total}`}
              aria-hidden={active !== index}
            >
              <Image
                src={image.url}
                alt={"제품 이미지 " + (index + 1)}
                fill
                loading={index === active ? "eager" : "lazy"}
                quality={90}
                sizes="(max-width: 767px) 100vw, 48vw"
                draggable={false}
                className="select-none object-contain p-[22px]"
              />
              <Button
                ref={(element) => {
                  zoomButtonsRef.current[index] = element
                }}
                variant="ghost"
                className="absolute inset-0 h-full w-full cursor-zoom-in rounded-none p-0 hover:bg-transparent active:cursor-grabbing focus-visible:ring-inset"
                aria-label={`제품 이미지 ${index + 1} 크게 보기`}
                tabIndex={active === index ? 0 : -1}
                onClick={() => setZoom(true)}
              >
                <span
                  className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full border border-border bg-background md:bottom-5 md:right-5"
                  aria-hidden="true"
                >
                  <HugeiconsIcon icon={ZoomInAreaIcon} />
                </span>
              </Button>
            </CarouselItem>
          ))}
          {video && (
            <CarouselItem
              className="relative aspect-square bg-[#171717] pl-0"
              aria-label={`제품 소개 영상, ${total} / ${total}`}
              aria-hidden={!showingVideo}
            >
              {/* 仅挂载当前视频，切换到图片时停止播放和声音。 */}
              {showingVideo &&
                (video.includes("youtube.com/embed/") ? (
                  <iframe
                    src={video}
                    title="제품 소개 영상"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <video
                    src={video}
                    controls
                    playsInline
                    poster={images[0]?.url}
                    aria-label="제품 소개 영상"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ))}
            </CarouselItem>
          )}
        </CarouselContent>
        {total > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background md:left-4"
              aria-label="이전 제품 이미지"
              onClick={() => select((active - 1 + total) % total)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background md:right-4"
              aria-label="다음 제품 이미지"
              onClick={() => select((active + 1) % total)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </>
        )}
        <span
          className="pointer-events-none absolute bottom-5 left-5 rounded-full bg-background px-3 py-1.5 text-[10px] tabular-nums text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {active + 1} / {total}
        </span>
      </Carousel>
      <Carousel
        setApi={setThumbnailsApi}
        opts={{
          align: "start",
          duration: 20,
          breakpoints: {
            "(prefers-reduced-motion: reduce)": { duration: 0 },
          },
        }}
        aria-label="제품 이미지 선택"
        className="min-w-0 md:px-12"
      >
        <CarouselContent className="-ml-2 cursor-grab touch-pan-y touch-pinch-zoom active:cursor-grabbing">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="basis-[72px] py-1 pl-2">
              <Button
                variant="ghost"
                onClick={() => select(index)}
                aria-label={"제품 이미지 " + (index + 1) + " 보기"}
                aria-current={active === index}
                aria-controls={galleryId}
                className={thumbnailClassName}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="70px"
                  draggable={false}
                  className="object-contain p-1"
                />
              </Button>
            </CarouselItem>
          ))}
          {video && (
            <CarouselItem className="basis-[72px] py-1 pl-2">
              <Button
                variant="ghost"
                className={thumbnailClassName + " flex-col gap-1"}
                onClick={() => select(images.length)}
                aria-label="제품 소개 영상 보기"
                aria-current={showingVideo}
                aria-controls={galleryId}
              >
                <HugeiconsIcon icon={PlayIcon} />
                <span className="text-[8px]">영상 보기</span>
              </Button>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious
          size="icon"
          className="left-0 hidden md:inline-flex"
          aria-label="이전 썸네일"
        />
        <CarouselNext
          size="icon"
          className="right-0 hidden md:inline-flex"
          aria-label="다음 썸네일"
        />
      </Carousel>
      {/* 放大期间可换图，关闭时应返回当前图片，而不是已隐藏的原图。 */}
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent
          className="w-[calc(100vw-2rem)] gap-4 p-4 sm:max-w-[1100px] sm:p-6"
          finalFocus={() => zoomButtonsRef.current[active]}
        >
          <DialogHeader>
            <DialogTitle>
              제품 이미지 {active + 1} / {images.length}
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[min(68svh,800px)]">
            {images[active] && (
              <Image
                src={images[active].url}
                fill
                quality={90}
                sizes="90vw"
                alt={"확대 제품 이미지 " + (active + 1)}
                className="object-contain"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  select((active - 1 + images.length) % images.length)
                }
                aria-label="이전 제품 이미지"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
                이전
              </Button>
              <Button
                variant="outline"
                onClick={() => select((active + 1) % images.length)}
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
