import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  LibraryBig,
  UserRound,
  Users2,
} from "lucide-react"

import { PortalReadOnlyNotice } from "@/components/portal/portal-read-only-notice"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { SummarySectionCard } from "@/components/shared/summary-section-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import type { PortalOverviewSummary } from "@/types/portal"

type PortalOverviewProps = {
  summary: PortalOverviewSummary
}

const parentQuickLinks = [
  {
    title: "الأبناء",
    description: "استعرض بطاقة كل طالب والصف الحالي وبيانات الارتباط.",
    href: appRoutes.portalStudents,
    icon: Users2,
  },
  {
    title: "الحضور",
    description: "تابع الحضور اليومي وأحدث حالات الغياب والتأخر.",
    href: appRoutes.portalAttendance,
    icon: CalendarCheck2,
  },
  {
    title: "المالية",
    description: "اطلع على الرصيد والفواتير المسجلة دون أي إجراء دفع.",
    href: appRoutes.portalFinance,
    icon: CircleDollarSign,
  },
  {
    title: "الإعلانات",
    description: "راجع آخر الإعلانات والفعاليات المناسبة للأبناء.",
    href: appRoutes.portalAnnouncements,
    icon: Bell,
  },
]

const studentQuickLinks = [
  {
    title: "بياناتي",
    description: "راجع بياناتك الأساسية والصف الحالي من مكان واحد.",
    href: appRoutes.portalStudents,
    icon: UserRound,
  },
  {
    title: "الدرجات",
    description: "اطلع على نتائج الاختبارات ومدخلات الدرجات الحديثة.",
    href: appRoutes.portalGrades,
    icon: BookOpen,
  },
  {
    title: "المكتبة",
    description: "تعرف على الكتب المستعارة ومواعيد الاستحقاق القريبة.",
    href: appRoutes.portalLibrary,
    icon: LibraryBig,
  },
  {
    title: "الإعلانات",
    description: "راجع الرسائل المدرسية والفعاليات القادمة المرتبطة بك.",
    href: appRoutes.portalAnnouncements,
    icon: Bell,
  },
]

export function PortalOverview({ summary }: PortalOverviewProps) {
  const parentIcons = [Users2, CalendarCheck2, CircleDollarSign, Bell]
  const studentIcons = [CalendarDays, BookOpen, CalendarCheck2, LibraryBig]
  const icons = summary.role === "parent" ? parentIcons : studentIcons
  const quickLinks = summary.role === "parent" ? parentQuickLinks : studentQuickLinks
  const readOnlyNotes =
    summary.role === "parent"
      ? [
          "يمكنك متابعة كل ابن من نفس البوابة دون الحاجة إلى التنقل داخل أسطح إدارية.",
          "لن تظهر هنا إلا السجلات المرتبطة فعليًا بحسابك داخل المدرسة الحالية.",
        ]
      : [
          "تعرض هذه الصفحة آخر ما نُشر لك من حضور ودرجات وإعارات وإعلانات.",
          "إذا احتجت إلى تعديل أي معلومة، تتم مراجعته من خلال إدارة المدرسة فقط.",
        ]

  return (
    <PageShell>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <PortalReadOnlyNotice notes={readOnlyNotes} />

        <Card className="border-border/70 bg-linear-to-br from-background to-muted/20 shadow-sm">
          <CardHeader>
            <CardTitle>نظرة سريعة</CardTitle>
            <CardDescription>
              استخدم هذا الملخص للوصول السريع إلى أكثر الصفحات فائدة داخل البوابة.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {summary.role === "parent" && summary.linkedChildren.length > 0
                ? summary.linkedChildren.slice(0, 3).map((child) => (
                    <Badge key={child.id} variant="secondary" className="rounded-full">
                      {child.title}
                    </Badge>
                  ))
                : null}
              <Badge variant="outline" className="rounded-full">
                {summary.role === "parent" ? "متابعة الأسرة" : "متابعة الطالب"}
              </Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {summary.role === "parent"
                ? "ابدأ ببطاقات الأبناء ثم افتح الحضور أو الدرجات أو المالية حسب الحاجة، وستبقى كل الصفحات للقراءة فقط."
                : "ابدأ من الدرجات أو الحضور أو الإعلانات حسب ما تحتاجه اليوم، وستبقى كل الصفحات ضمن سياقك الدراسي فقط."}
            </p>
          </CardContent>
        </Card>
      </section>

      <KpiGrid
        items={summary.stats.map((item, index) => ({
          ...item,
          icon: icons[index],
        }))}
      />

      <PageSection
        title="تنقل سريع"
        description="روابط مختصرة إلى أهم أقسام البوابة اليومية على الهاتف وسطح المكتب."
        contentClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        {quickLinks.map((item) => {
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full border-border/70 bg-linear-to-br from-background to-muted/20 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <CardHeader className="gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl border border-border/60 bg-secondary/10 text-secondary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-sm leading-6">
                        {item.description}
                      </CardDescription>
                    </div>
                    <ArrowLeft className="mt-0.5 size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </PageSection>

      {summary.role === "parent" && summary.linkedChildren.length === 0 ? (
        <EmptyState
          title="لا توجد روابط طلاب لهذا الحساب"
          description="تم التحقق من الحساب بنجاح، لكن لا يظهر ارتباط طالب فعّال بهذا المستخدم داخل المدرسة الحالية. عند إتمام الربط ستظهر هنا بطاقات الأبناء وبقية الأقسام المسموح بها."
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
