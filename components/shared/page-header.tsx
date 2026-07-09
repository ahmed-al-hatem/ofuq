import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
  badge?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-linear-to-br from-background via-background to-muted/30 p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? (
              <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            {typeof badge === "string" ? <Badge variant="outline">{badge}</Badge> : badge}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
