import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowLeft } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LoginCardProps = {
  description: string
  href: string
  icon: LucideIcon
  title: string
  tone?: "staff" | "portal"
}

const toneStyles = {
  portal: {
    accent: "text-secondary",
    border: "hover:border-secondary/35",
    icon: "bg-secondary/12 text-secondary",
  },
  staff: {
    accent: "text-primary",
    border: "hover:border-primary/35",
    icon: "bg-primary/12 text-primary",
  },
}

export function LoginCard({
  description,
  href,
  icon: Icon,
  title,
  tone = "staff",
}: LoginCardProps) {
  const theme = toneStyles[tone]

  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "h-full border-border/70 bg-card/95 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg",
          theme.border
        )}
      >
        <CardHeader className="gap-4">
          <div className={cn("flex size-12 items-center justify-center rounded-2xl", theme.icon)}>
            <Icon className="size-5" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <span
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium transition-transform group-hover:-translate-x-0.5",
              theme.accent
            )}
          >
            الانتقال إلى صفحة الدخول
            <ArrowLeft className="size-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
