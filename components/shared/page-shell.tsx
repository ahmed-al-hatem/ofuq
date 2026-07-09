import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return <div className={cn("flex flex-col gap-6 lg:gap-8", className)}>{children}</div>
}
