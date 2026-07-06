import { BarChart3, CalendarCheck2, CircleDollarSign, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"

const dashboardCards = [
  {
    title: "الطلاب",
    value: "0",
    description: "لا توجد بيانات فعلية بعد. هذا مكان ملخص القبولات والملفات.",
    icon: Users,
    status: "neutral" as const,
  },
  {
    title: "الحضور",
    value: "0%",
    description: "مخطط جاهز لملخص الحضور اليدوي وQR لاحقًا.",
    icon: CalendarCheck2,
    status: "info" as const,
  },
  {
    title: "المالية",
    value: "0",
    description: "الرسوم والفواتير والمدفوعات ستتصل هنا في المرحلة التالية.",
    icon: CircleDollarSign,
    status: "warning" as const,
  },
  {
    title: "التقارير",
    value: "0",
    description: "لوحات وتقارير جاهزة للاستخدام مع أول مجموعة بيانات حقيقية.",
    icon: BarChart3,
    status: "success" as const,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة التحكم"
        description="ملخص تأسيسي قابل للتوسع قبل ربط الوحدات التشغيلية."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-3xl">{card.value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatusBadge status={card.status}>جاهز للمرحلة التالية</StatusBadge>
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>ملاحظات التأسيس</CardTitle>
          <CardDescription>
            هذه المساحة ستتحول لاحقًا إلى نشاط حديث، لكن الآن تبقى واضحة وخفيفة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="لا توجد سجلات فعلية بعد"
            description="بمجرد توصيل Supabase والبيانات الأساسية ستتحول هذه المساحة إلى لوحة تشغيل حقيقية."
          />
        </CardContent>
      </Card>
    </div>
  )
}
