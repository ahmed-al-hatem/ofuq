import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AuthTone = "chooser" | "staff" | "portal" | "reset"

export type AuthShellHighlight = {
  description: string
  icon: LucideIcon
  title: string
}

type AuthShellProps = {
  badge: string
  children: ReactNode
  description: string
  footer?: ReactNode
  highlights: AuthShellHighlight[]
  title: string
  tone?: AuthTone
}

const toneStyles: Record<
  AuthTone,
  {
    badge: string
    glowPrimary: string
    glowSecondary: string
    panelBorder: string
    panelOverlay: string
  }
> = {
  chooser: {
    badge: "bg-primary/10 text-primary",
    glowPrimary: "bg-primary/18",
    glowSecondary: "bg-secondary/16",
    panelBorder: "border-primary/18",
    panelOverlay:
      "bg-[linear-gradient(135deg,hsl(var(--primary)/0.1),transparent_55%)]",
  },
  staff: {
    badge: "bg-primary text-primary-foreground",
    glowPrimary: "bg-primary/20",
    glowSecondary: "bg-accent/16",
    panelBorder: "border-primary/24",
    panelOverlay:
      "bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),transparent_58%)]",
  },
  portal: {
    badge: "bg-secondary text-secondary-foreground",
    glowPrimary: "bg-secondary/22",
    glowSecondary: "bg-accent/14",
    panelBorder: "border-secondary/22",
    panelOverlay:
      "bg-[linear-gradient(135deg,hsl(var(--secondary)/0.16),transparent_60%)]",
  },
  reset: {
    badge: "bg-accent/20 text-foreground",
    glowPrimary: "bg-accent/20",
    glowSecondary: "bg-primary/14",
    panelBorder: "border-accent/24",
    panelOverlay:
      "bg-[linear-gradient(135deg,hsl(var(--accent)/0.18),transparent_58%)]",
  },
}

export function AuthShell({
  badge,
  children,
  description,
  footer,
  highlights,
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.34)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.34)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section
          className={cn(
            "relative overflow-hidden rounded-[2rem] border bg-card/90 p-6 shadow-sm backdrop-blur sm:p-8",
            theme.panelBorder
          )}
        >
          <div className={cn("absolute inset-0 opacity-100", theme.panelOverlay)} />

          <div className="relative flex flex-col gap-6">
            <Badge className={cn("w-fit rounded-full px-3 py-1", theme.badge)}>
              {badge}
            </Badge>

            <div className="flex flex-col gap-3">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>

            <div className="grid gap-3">
              {highlights.map((highlight) => {
                const Icon = highlight.icon

                return (
                  <div
                    key={highlight.title}
                    className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/85 px-4 py-3"
                  >
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{highlight.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {footer ? <div className="pt-1">{footer}</div> : null}
          </div>
        </section>

        <div className="relative">{children}</div>
      </div>
    </main>
  )
}
