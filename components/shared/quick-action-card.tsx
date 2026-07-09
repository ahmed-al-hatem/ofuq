import Link from "next/link"
import type { ComponentType } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type QuickActionCardProps = {
  title: string
  description: string
  href: string
  icon?: ComponentType<{ className?: string }>
}

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
          {Icon ? <Icon className="size-5" /> : null}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent />
      <CardFooter>
        <Link
          href={href}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          انتقال سريع
        </Link>
      </CardFooter>
    </Card>
  )
}
