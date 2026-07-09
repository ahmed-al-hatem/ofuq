import { Bell, BookOpen, CalendarCheck2, CalendarDays, CircleDollarSign, LibraryBig, Users2 } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SummarySectionCard } from "@/components/shared/summary-section-card"
import type { PortalOverviewSummary } from "@/types/portal"

type PortalOverviewProps = {
  summary: PortalOverviewSummary
}

export function PortalOverview({ summary }: PortalOverviewProps) {
  const parentIcons = [Users2, CalendarCheck2, CircleDollarSign, Bell]
  const studentIcons = [CalendarDays, BookOpen, CalendarCheck2, LibraryBig]
  const icons = summary.role === "parent" ? parentIcons : studentIcons

  return (
    <PageShell>
      <PageHeader
        eyebrow="بوابة المتابعة"
        title={summary.title}
        description={summary.description}
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <KpiGrid
        items={summary.stats.map((item, index) => ({
          ...item,
          icon: icons[index],
        }))}
      />

      {summary.role === "parent" && summary.linkedChildren.length === 0 ? (
        <EmptyState
          title="لا توجد روابط طلاب لهذا الحساب"
          description="تم التحقق من الحساب بنجاح، لكن لا يظهر ارتباط طالب فعّال بهذا المستخدم داخل المدرسة الحالية."
        />
      ) : null}

      <PageSection
        title="ملخص المتابعة"
        description="أهم الأقسام المقروءة المرتبطة بحسابك داخل المدرسة الحالية."
        contentClassName="grid gap-4 xl:grid-cols-2"
      >
        {summary.role === "parent" ? (
          <SummarySectionCard
            title="الأبناء المرتبطون"
            description="ملخص الطلاب المرتبطين بهذا الحساب داخل المدرسة الحالية."
            items={summary.linkedChildren}
            emptyTitle="لا توجد روابط طلاب مطابقة حاليًا"
            emptyDescription="يرجى مراجعة الإدارة عند الحاجة إلى ربط الحساب بأحد الأبناء."
          />
        ) : null}

        <SummarySectionCard
          title={summary.role === "parent" ? "ملخص الحضور" : "حالة الحضور"}
          description="آخر السجلات المقروءة ضمن صلاحية هذه البوابة."
          items={summary.attendanceHighlights}
          emptyTitle="لا توجد سجلات حضور مطابقة حاليًا"
          emptyDescription="يمكنك مراجعة قسم الحضور للاطلاع على السجلات المتاحة."
        />

        <SummarySectionCard
          title="آخر الدرجات"
          description="أحدث النتائج أو المدخلات أو بطاقات التقييم المعروضة."
          items={summary.latestGrades}
          emptyTitle="لا توجد درجات مطابقة حاليًا"
          emptyDescription="راجع قسم الدرجات لمتابعة النتائج المتاحة."
        />

        {summary.role === "parent" ? (
          <SummarySectionCard
            title="ملخص الفواتير"
            description="نظرة سريعة على الفواتير والرصيد القائم للأبناء المرتبطين."
            items={summary.financeHighlights}
            emptyTitle="لا توجد فواتير مطابقة حاليًا"
            emptyDescription="ستظهر السجلات المالية هنا عند توفر فواتير أو مدفوعات مرتبطة بالأبناء."
          />
        ) : (
          <SummarySectionCard
            title="كتبي المستعارة"
            description="الكتب أو النسخ التي ما زالت معروضة ضمن سجل الإعارة الشخصي."
            items={summary.libraryHighlights}
            emptyTitle="لا توجد إعارات مطابقة حاليًا"
            emptyDescription="يمكنك مراجعة قسم المكتبة عند توفر سجلات إعارة."
          />
        )}

        <SummarySectionCard
          title={summary.role === "parent" ? "الجدول القادم" : "جدولي القريب"}
          description="أقرب الحصص الظاهرة ضمن الشعبة أو الصف المرتبط."
          items={summary.upcomingTimetable}
          emptyTitle="لا توجد حصص مطابقة حاليًا"
          emptyDescription="راجع قسم الجدول للاطلاع على الجدول المتاح."
        />

        <SummarySectionCard
          title="الإعلانات الأخيرة"
          description="آخر الإعلانات والفعاليات المناسبة لسياق الطالب."
          items={summary.recentAnnouncements}
          emptyTitle="لا توجد إعلانات مطابقة حاليًا"
          emptyDescription="راجع قسم الإعلانات للاطلاع على المنشورات والفعاليات."
        />
      </PageSection>
    </PageShell>
  )
}
