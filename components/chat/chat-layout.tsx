import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ChatLayoutProps = {
  sidebar: ReactNode
  main: ReactNode
  className?: string
}

export function ChatLayout({ sidebar, main, className }: ChatLayoutProps) {
  return (
    <section
      className={cn(
        "grid gap-4 xl:grid-cols-[minmax(19rem,24rem)_minmax(0,1fr)]",
        className
      )}
    >
      <div className="min-w-0">{sidebar}</div>
      <div className="min-w-0">{main}</div>
    </section>
  )
}
