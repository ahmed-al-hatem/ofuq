import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageSectionProps = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: PageSectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {title || description || actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}
            {description ? (
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={contentClassName}>{children}</div>
    </section>
  )
}
