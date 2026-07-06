import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger"

type StatusBadgeProps = {
  status?: StatusTone
  className?: string
  children: ReactNode
}

const statusClasses: Record<StatusTone, string> = {
  neutral: "border-border bg-background text-foreground",
  info: "border-transparent bg-primary/10 text-primary",
  success: "border-transparent bg-secondary/10 text-secondary",
  warning: "border-transparent bg-accent/20 text-accent-foreground",
  danger: "border-transparent bg-destructive/10 text-destructive",
}

export function StatusBadge({
  status = "neutral",
  className,
  children,
}: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusClasses[status], className)}>
      {children}
    </Badge>
  )
}
