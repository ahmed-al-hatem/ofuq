import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description: string
  icon?: LucideIcon
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  align?: "center" | "start"
  size?: "default" | "compact"
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  align = "center",
  size = "default",
  className,
}: EmptyStateProps) {
  const centered = align === "center"
  const compact = size === "compact"

  const actionButton = action?.href ? (
    <Link href={action.href} className={buttonVariants()}>
      {action.label}
    </Link>
  ) : action ? (
    <Button type="button" onClick={action.onClick}>
      {action.label}
    </Button>
  ) : null

  return (
    <Card
      className={cn(
        "border-dashed border-border/80 bg-linear-to-br from-muted/20 via-background to-muted/30 shadow-sm",
        className
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-4",
          centered ? "items-center text-center" : "items-start text-start",
          compact ? "px-5 py-8" : "px-6 py-12"
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background text-primary shadow-sm">
          {Icon ? <Icon className="size-5" /> : <Badge variant="outline">فارغ</Badge>}
        </div>
        <CardHeader className="w-full gap-2 p-0">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription
            className={cn(
              "text-sm leading-6",
              centered ? "mx-auto max-w-xl" : "max-w-2xl"
            )}
          >
            {description}
          </CardDescription>
        </CardHeader>
        {actionButton}
      </CardContent>
    </Card>
  )
}
