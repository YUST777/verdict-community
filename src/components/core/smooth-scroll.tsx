"use client"

import type { ReactNode } from "react"

export function SmoothScroll({ children }: { children: ReactNode }) {
  // Disabled smooth scroll - just render children directly
  return <>{children}</>
}
