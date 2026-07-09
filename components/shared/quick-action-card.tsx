import Link from "next/link"
import type { ComponentType } from "react"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className="border-border/70 bg-linear-to-br from-background to-muted/20 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted text-primary">
          {Icon ? <Icon className="size-5" /> : null}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Badge variant="outline" className="w-fit rounded-full">
            إجراء سريع
          </Badge>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm leading-6">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <Link
          href={href}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-full")}
        >
          <ArrowLeft data-icon="inline-start" />
          انتقال سريع
        </Link>
      </CardFooter>
    </Card>
  )
}
