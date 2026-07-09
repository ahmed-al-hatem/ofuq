import { Bell, BookOpen, CalendarCheck2, CalendarDays, NotebookPen, Presentation } from "lucide-react"

import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { QuickActionCard } from "@/components/shared/quick-action-card"
import { SummarySectionCard } from "@/components/shared/summary-section-card"
import { appRoutes } from "@/constants/routes"
import type { TeacherDashboardSummary } from "@/types/dashboard"

type TeacherDashboardProps = {
  summary: TeacherDashboardSummary
}

const quickActionIcons = [CalendarCheck2, NotebookPen, CalendarDays, Bell]

export function TeacherDashboard({ summary }: TeacherDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة المعلم"
        description="نظرة عامة على أعمالك اليومية، من الجدول والحضور حتى الدرجات والإعلانات."
      />

      <KpiGrid
        items={[
          {
            title: "حصص اليوم",
            value: summary.todayTimetableSlotsCount,
            description: "عدد الحصص المجدولة لهذا اليوم.",
            icon: CalendarDays,
            href: appRoutes.timetable,
          },
          {
            title: "المواد المسندة",
            value: summary.assignedSubjectsCount,
            description: "إجمالي المواد أو الشعب التعليمية المسندة لك.",
            icon: BookOpen,
            href: appRoutes.timetableAssignments,
            tone: "info",
          },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {summary.quickActions.map((action, index) => {
          const Icon = quickActionIcons[index] ?? Presentation

          return <QuickActionCard key={action.title} {...action} icon={Icon} />
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SummarySectionCard
          title="جدولي اليوم"
          description="أقرب الحصص المجدولة لهذا اليوم."
          items={summary.todayTimetableSlots}
          emptyTitle="لا توجد حصص مجدولة حاليًا"
          emptyDescription="راجع قسم الجدول لمعرفة الحصص المتاحة."
        />
        <SummarySectionCard
          title="آخر جلسات الحضور"
          description="آخر الجلسات التي سجلتها أو تابعتها."
          items={summary.recentAttendanceSessions}
          emptyTitle="لا توجد جلسات حضور مطابقة حاليًا"
          emptyDescription="ابدأ من قسم الحضور عند الحاجة إلى جلسة جديدة."
        />
        <SummarySectionCard
          title="آخر الاختبارات"
          description="أحدث الاختبارات أو الأعمال المقيدة من حسابك."
          items={summary.recentExams}
          emptyTitle="لا توجد اختبارات مطابقة حاليًا"
          emptyDescription="يمكنك الانتقال إلى الدرجات لمتابعة الاختبارات والمدخلات."
        />
        <SummarySectionCard
          title="الإعلانات الأخيرة"
          description="آخر الإعلانات المنشورة داخل المدرسة."
          items={summary.recentAnnouncements}
          emptyTitle="لا توجد إعلانات حديثة حاليًا"
          emptyDescription="راجع قسم التواصل للاطلاع على الرسائل والإعلانات."
        />
      </section>
    </div>
  )
}
