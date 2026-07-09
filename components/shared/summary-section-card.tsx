import Link from "next/link"

import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="flex flex-col gap-1">
      <p className="font-medium text-foreground">{item.title}</p>
      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
      {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
    </div>
  )

  if (!item.href) {
    return content
  }

  return (
    <Link href={item.href} className="rounded-xl transition hover:bg-muted/40 focus:outline-none">
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
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={index === items.length - 1 ? "" : "border-b border-border/60 pb-4"}
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
