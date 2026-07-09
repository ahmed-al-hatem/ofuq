import Link from "next/link"
import type { ComponentType } from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string | number
  description?: string
  icon?: ComponentType<{ className?: string }>
  href?: string
  tone?: "default" | "info" | "success" | "warning" | "danger"
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-muted text-primary",
  info: "bg-primary/10 text-primary",
  success: "bg-secondary/10 text-secondary",
  warning: "bg-accent/20 text-accent-foreground",
  danger: "bg-destructive/10 text-destructive",
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-3xl">{value}</CardTitle>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
            toneClasses[tone]
          )}
        >
          {Icon ? <Icon className="size-5" /> : null}
        </div>
      </CardHeader>
      {description ? (
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </CardContent>
      ) : null}
      {href ? (
        <CardFooter>
          <Link href={href} className={buttonVariants({ size: "sm", variant: "outline" })}>
            فتح القسم
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  )
}
