import { MessageSquareMore } from "lucide-react"

import { cn } from "@/lib/utils"

type ChatEmptyStateProps = {
  title: string
  description: string
  className?: string
}

export function ChatEmptyState({
  title,
  description,
  className,
}: ChatEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background text-primary shadow-sm">
        <MessageSquareMore className="size-5" />
      </div>
      <div className="flex max-w-xl flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
