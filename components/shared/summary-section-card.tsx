import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SummarySectionItem = {
  id: string
  title: string
  description: string
  meta?: string
  href?: string
}

type SummarySectionCardProps = {
  title: string
  description: string
  items: SummarySectionItem[]
  emptyTitle: string
  emptyDescription: string
}

function SummarySectionRow({ item }: { item: SummarySectionItem }) {
  const content = (
    <div className="flex items-start gap-3 rounded-2xl border border-transparent px-4 py-3 transition-colors">
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {item.meta ? (
          <Badge variant="outline" className="rounded-full">
            {item.meta}
          </Badge>
        ) : null}
        {item.href ? <ArrowLeft className="size-4 text-muted-foreground" /> : null}
      </div>
    </div>
  )

  if (!item.href) {
    return content
  }

  return (
    <Link
      href={item.href}
      className="rounded-2xl transition hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {content}
    </Link>
  )
}

export function SummarySectionCard({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
}: SummarySectionCardProps) {
  return (
    <Card className="border-border/70 bg-linear-to-br from-background to-muted/20 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            size="compact"
            className="bg-transparent shadow-none"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl bg-background/70",
                  index === items.length - 1 ? "" : "border border-border/60"
                )}
              >
                <SummarySectionRow item={item} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
