"use client"

import { useEffect, useRef, type ReactNode } from "react"

export default function HomeExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // 入场动画不隐藏初始内容，保证服务端首屏和键盘导航始终可读。
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.animate(
            [
              { opacity: 0, transform: "translateY(28px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          )
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12 }
    )
    root
      .current!.querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="home-experience overflow-clip" ref={root}>
      {children}
    </div>
  )
}
