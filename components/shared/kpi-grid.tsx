import { StatCard } from "@/components/shared/stat-card"

type KpiGridProps = {
  items: Array<Parameters<typeof StatCard>[0]>
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </section>
  )
}
