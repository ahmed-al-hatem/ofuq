import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AuthTone = "chooser" | "staff" | "portal" | "reset"

type AuthShellProps = {
  badge: string
  children: ReactNode
  description: string
  footer?: ReactNode
  title: string
  tone?: AuthTone
}

const toneStyles: Record<
  AuthTone,
  {
    badge: string
    childWidth: string
    glowPrimary: string
    glowSecondary: string
  }
> = {
  chooser: {
    badge: "bg-primary/10 text-primary",
    childWidth: "max-w-4xl",
    glowPrimary: "bg-primary/16",
    glowSecondary: "bg-secondary/14",
  },
  staff: {
    badge: "bg-primary text-primary-foreground",
    childWidth: "max-w-xl",
    glowPrimary: "bg-primary/18",
    glowSecondary: "bg-accent/14",
  },
  portal: {
    badge: "bg-secondary text-secondary-foreground",
    childWidth: "max-w-xl",
    glowPrimary: "bg-secondary/18",
    glowSecondary: "bg-accent/12",
  },
  reset: {
    badge: "bg-accent/20 text-foreground",
    childWidth: "max-w-xl",
    glowPrimary: "bg-accent/18",
    glowSecondary: "bg-primary/12",
  },
}

export function AuthShell({
  badge,
  children,
  description,
  footer,
  title,
  tone = "chooser",
}: AuthShellProps) {
  const theme = toneStyles[tone]

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute start-[-6rem] top-[-5rem] size-56 rounded-full blur-3xl",
            theme.glowPrimary
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-6rem] end-[-5rem] size-72 rounded-full blur-3xl",
            theme.glowSecondary
          )}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.28)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.28)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col items-center justify-center gap-6">
        <section className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
          <Badge className={cn("w-fit rounded-full px-3 py-1", theme.badge)}>
            {badge}
          </Badge>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </section>

        <div className={cn("relative w-full", theme.childWidth)}>{children}</div>

        {footer ? (
          <div className="relative flex w-full max-w-4xl justify-center">{footer}</div>
        ) : null}
      </div>
    </main>
  )
}
