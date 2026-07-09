import { BookCopy, BookMarked, LibraryBig, NotebookText, TriangleAlert } from "lucide-react"

import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { QuickActionCard } from "@/components/shared/quick-action-card"
import { SummarySectionCard } from "@/components/shared/summary-section-card"
import { appRoutes } from "@/constants/routes"
import type { LibrarianDashboardSummary } from "@/types/dashboard"

type LibrarianDashboardProps = {
  summary: LibrarianDashboardSummary
}

const quickActionIcons = [BookMarked, BookCopy, NotebookText, TriangleAlert]

export function LibrarianDashboard({ summary }: LibrarianDashboardProps) {
  return (
    <PageShell>
      <PageHeader
        eyebrow="لوحة المكتبة"
        title="لوحة المكتبة"
        description="تابع الفهرس والإعارات والحالات التي تحتاج متابعة من واجهة عملية وسريعة القراءة."
      />

      <KpiGrid
        items={[
          {
            title: "عناوين الفهرس",
            value: summary.catalogCount,
            description: "إجمالي العناوين المسجلة داخل المكتبة.",
            icon: LibraryBig,
            href: appRoutes.libraryCatalog,
          },
          {
            title: "نسخ الكتب",
            value: summary.copiesCount,
            description: "إجمالي النسخ التشغيلية غير المؤرشفة.",
            icon: BookCopy,
            href: appRoutes.libraryCopies,
            tone: "info",
          },
          {
            title: "النسخ المتاحة",
            value: summary.availableCopiesCount,
            description: "النسخ الجاهزة للإعارة حاليًا.",
            icon: BookMarked,
            href: appRoutes.libraryCopies,
            tone: "success",
          },
          {
            title: "الإعارات المتأخرة",
            value: summary.overdueLoansCount,
            description: "حالات تحتاج متابعة من موظف المكتبة.",
            icon: TriangleAlert,
            href: appRoutes.libraryOverdue,
            tone: "warning",
          },
        ]}
      />

      <PageSection
        title="الإجراءات السريعة"
        description="انتقل مباشرة إلى أكثر المهام استخدامًا في إدارة المكتبة."
        contentClassName="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"
      >
        {summary.quickActions.map((action, index) => {
          const Icon = quickActionIcons[index] ?? LibraryBig

          return <QuickActionCard key={action.title} {...action} icon={Icon} />
        })}
      </PageSection>

      <PageSection
        title="حالة التشغيل"
        description="الأقسام التالية تعرض حركة الإعارة والمؤشرات التي تستحق انتباهًا سريعًا."
        contentClassName="grid gap-4 xl:grid-cols-2"
      >
        <SummarySectionCard
          title="آخر الإعارات"
          description="الحركة الحديثة للكتب المستعارة داخل المكتبة."
          items={summary.recentLoans}
          emptyTitle="لا توجد إعارات مطابقة حاليًا"
          emptyDescription="انتقل إلى قسم الإعارات لمراجعة السجلات المتاحة."
        />
        <SummarySectionCard
          title="ملخص التشغيل"
          description="أهم المؤشرات التشغيلية للمكتبة الحالية."
          items={[
            {
              id: "active-loans",
              title: "الإعارات النشطة",
              description: `${summary.activeLoansCount} إعارة ما زالت مفتوحة`,
              href: appRoutes.libraryLoans,
            },
            {
              id: "overdue-loans",
              title: "الإعارات المتأخرة",
              description: `${summary.overdueLoansCount} إعارة تحتاج متابعة`,
              href: appRoutes.libraryOverdue,
            },
            {
              id: "available-copies",
              title: "النسخ المتاحة",
              description: `${summary.availableCopiesCount} نسخة جاهزة للإعارة`,
              href: appRoutes.libraryCopies,
            },
          ]}
          emptyTitle="لا توجد بيانات مكتبية مطابقة حاليًا"
          emptyDescription="انتقل إلى قسم المكتبة لمراجعة السجلات المتاحة."
        />
      </PageSection>
    </PageShell>
  )
}
