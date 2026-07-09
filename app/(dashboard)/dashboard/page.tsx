import { BarChart3, CalendarCheck2, CircleDollarSign, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"

const dashboardCards = [
  {
    title: "الطلاب",
    value: "0",
    description: "تابع ملفات الطلاب والطلبات الحديثة من قسم الطلاب والقبول.",
    icon: Users,
    status: "neutral" as const,
    badge: "ملفات الطلاب",
  },
  {
    title: "الحضور",
    value: "0%",
    description: "راجع الحضور اليومي والجلسات المفتوحة من قسم الحضور.",
    icon: CalendarCheck2,
    status: "info" as const,
    badge: "متابعة يومية",
  },
  {
    title: "المالية",
    value: "0",
    description: "انتقل إلى قسم المالية لمراجعة الرسوم والفواتير والمدفوعات.",
    icon: CircleDollarSign,
    status: "warning" as const,
    badge: "التحصيل المالي",
  },
  {
    title: "التقارير",
    value: "0",
    description: "راجع التقارير الجاهزة لمتابعة مؤشرات المدرسة الأساسية.",
    icon: BarChart3,
    status: "success" as const,
    badge: "مؤشرات سريعة",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة تشغيل المدرسة"
        description="نظرة عامة على أهم أعمال المدرسة اليومية."
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
                <StatusBadge status={card.status}>{card.badge}</StatusBadge>
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
          <CardTitle>متابعة السجلات</CardTitle>
          <CardDescription>
            اعتمد على الروابط الجانبية للوصول السريع إلى الطلاب والحضور والمالية والتقارير.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="لا توجد سجلات مطابقة حاليًا"
            description="ابدأ من الأقسام الجانبية لإدارة أعمال المدرسة ومراجعة البيانات المتاحة."
          />
        </CardContent>
      </Card>
    </div>
  )
}
