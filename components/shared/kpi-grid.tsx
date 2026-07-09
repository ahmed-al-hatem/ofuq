import { StatCard } from "@/components/shared/stat-card"
import { cn } from "@/lib/utils"

type KpiGridProps = {
  items: Array<Parameters<typeof StatCard>[0]>
  className?: string
}

export function KpiGrid({ items, className }: KpiGridProps) {
  return (
    <section className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </section>
  )
}
