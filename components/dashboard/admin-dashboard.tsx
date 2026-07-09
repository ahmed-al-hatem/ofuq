import { Bell, CalendarCheck2, CircleDollarSign, ClipboardList, FileText, Users2 } from "lucide-react"

import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { QuickActionCard } from "@/components/shared/quick-action-card"
import { SummarySectionCard } from "@/components/shared/summary-section-card"
import { appRoutes } from "@/constants/routes"
import type { AdminDashboardSummary } from "@/types/dashboard"

type AdminDashboardProps = {
  summary: AdminDashboardSummary
}

const quickActionIcons = [Users2, FileText, CalendarCheck2, CircleDollarSign]

export function AdminDashboard({ summary }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة تشغيل المدرسة"
        description="نظرة عامة على الأعمال اليومية والمجالات التي تحتاج متابعة تشغيلية."
      />

      <KpiGrid
        items={[
          {
            title: "الطلاب النشطون",
            value: summary.activeStudentsCount,
            description: "عدد الطلاب النشطين في المدرسة الحالية.",
            icon: Users2,
            href: appRoutes.students,
          },
          {
            title: "طلبات القبول المعلقة",
            value: summary.pendingAdmissionsCount,
            description: "طلبات تحتاج إلى مراجعة واعتماد.",
            icon: FileText,
            href: appRoutes.admissions,
            tone: "info",
          },
          {
            title: "الشكاوى المفتوحة",
            value: summary.openComplaintsCount,
            description: "الحالات التي ما زالت قيد المتابعة.",
            icon: ClipboardList,
            href: appRoutes.feedbackComplaints,
            tone: "warning",
          },
          {
            title: "الفواتير غير المحصلة",
            value: summary.unpaidInvoicesCount,
            description: "فواتير تحتاج إلى تحصيل أو متابعة مالية.",
            icon: CircleDollarSign,
            href: appRoutes.financeInvoices,
            tone: "success",
          },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {summary.quickActions.map((action, index) => {
          const Icon = quickActionIcons[index] ?? Bell

          return <QuickActionCard key={action.title} {...action} icon={Icon} />
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SummarySectionCard
          title="آخر جلسات الحضور"
          description="جلسات الحضور الحديثة لمتابعة التنفيذ اليومي."
          items={summary.recentAttendanceSessions}
          emptyTitle="لا توجد جلسات حضور مطابقة حاليًا"
          emptyDescription="يمكنك مراجعة قسم الحضور للاطلاع على السجلات المتاحة."
        />
        <SummarySectionCard
          title="آخر المدفوعات"
          description="آخر السندات والمدفوعات التي سُجلت داخل المدرسة."
          items={summary.recentPayments}
          emptyTitle="لا توجد مدفوعات مطابقة حاليًا"
          emptyDescription="انتقل إلى المالية لمراجعة الفواتير والتحصيل."
        />
        <SummarySectionCard
          title="الإعلانات المنشورة"
          description="آخر الإعلانات المتاحة للمدرسة الحالية."
          items={summary.recentAnnouncements}
          emptyTitle="لا توجد إعلانات منشورة حاليًا"
          emptyDescription="يمكن نشر إعلان جديد من قسم التواصل عند الحاجة."
        />
        <SummarySectionCard
          title="الفعاليات القادمة"
          description="المواعيد الأقرب التي تتطلب استعدادًا أو تنسيقًا."
          items={summary.upcomingEvents}
          emptyTitle="لا توجد فعاليات قادمة حاليًا"
          emptyDescription="أضف فعالية من قسم التواصل عند الحاجة."
        />
      </section>
    </div>
  )
}
