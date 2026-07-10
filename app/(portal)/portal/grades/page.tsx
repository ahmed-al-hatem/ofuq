import { BookOpenCheck, FileText, NotebookText, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requirePortalContext } from "@/lib/portal/context"
import { listPortalGrades } from "@/lib/portal/grades"
import {
  EXAM_RESULT_STATUS_LABELS_AR,
  EXAM_RESULT_STATUS_TONES,
  GRADE_ENTRY_CATEGORY_LABELS_AR,
  GRADE_ENTRY_STATUS_LABELS_AR,
  GRADE_ENTRY_STATUS_TONES,
  REPORT_CARD_STATUS_LABELS_AR,
  REPORT_CARD_STATUS_TONES,
} from "@/types/grades"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function formatNumber(value: number | null) {
  if (value === null) {
    return "-"
  }

  return new Intl.NumberFormat("ar-SY").format(value)
}

export default async function PortalGradesPage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الدرجات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الدرجات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const grades = await listPortalGrades(contextResult.data)
  const hasAnyData =
    grades.examResults.length > 0 ||
    grades.gradeEntries.length > 0 ||
    grades.reportCards.length > 0
  const publishedReportCards = grades.reportCards.filter(
    (reportCard) => reportCard.status === "published"
  ).length

  return (
    <PageShell>
      <PageHeader
        title="الدرجات"
        description="عرض قراءة فقط لنتائج الاختبارات، مدخلات الدرجات، وبطاقات التقييم المنشأة."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      {!hasAnyData ? (
        <EmptyState
          icon={BookOpenCheck}
          title="لا توجد بيانات درجات متاحة"
          description="لم تُسجل بعد نتائج أو بطاقات تقييم للطلاب المسموح بعرضهم."
        />
      ) : null}

      {hasAnyData ? (
        <KpiGrid
          items={[
            {
              title: "نتائج الاختبارات",
              value: grades.examResults.length,
              description: "آخر نتائج الاختبارات المسموح بعرضها.",
              icon: BookOpenCheck,
              tone: "info",
            },
            {
              title: "مدخلات الدرجات",
              value: grades.gradeEntries.length,
              description: "واجبات وأنشطة ومشاركات مضافة من المدرسة.",
              icon: NotebookText,
              tone: "warning",
            },
            {
              title: "بطاقات التقييم المنشورة",
              value: publishedReportCards,
              description: "عدد البطاقات المنشورة الجاهزة للمراجعة.",
              icon: FileText,
              tone: "success",
            },
          ]}
          className="xl:grid-cols-3"
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>نتائج الاختبارات</CardTitle>
            <CardDescription>يعرض آخر النتائج المتاحة للقراءة فقط.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {grades.examResults.length === 0 ? (
              <EmptyState
                title="لا توجد نتائج اختبارات"
                description="لم تُنشر أو تُدخل نتائج اختبارات ضمن هذا النطاق بعد."
              />
            ) : (
              grades.examResults.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{item.exam_title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.student_name} - {item.subject_name}
                      </p>
                    </div>
                    <StatusBadge status={EXAM_RESULT_STATUS_TONES[item.status]}>
                      {EXAM_RESULT_STATUS_LABELS_AR[item.status]}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-sm">
                      {formatNumber(item.score)} / {formatNumber(item.max_score)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.exam_date ? formatDate(item.exam_date) : "بدون تاريخ"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>مدخلات الدرجات</CardTitle>
            <CardDescription>
              واجبات ومشاركات وأنشطة مقيدة مسبقًا.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {grades.gradeEntries.length === 0 ? (
              <EmptyState
                title="لا توجد مدخلات درجات"
                description="لم تُسجل مدخلات درجات ضمن هذا النطاق بعد."
              />
            ) : (
              grades.gradeEntries.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.student_name} - {item.subject_name}
                      </p>
                    </div>
                    <StatusBadge status={GRADE_ENTRY_STATUS_TONES[item.status]}>
                      {GRADE_ENTRY_STATUS_LABELS_AR[item.status]}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {GRADE_ENTRY_CATEGORY_LABELS_AR[item.category]}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full text-sm">
                      {formatNumber(item.score)} / {formatNumber(item.max_score)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(item.recorded_on)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>بطاقات التقييم</CardTitle>
            <CardDescription>
              عرض موجز للبطاقات الموجودة دون إنشاء PDF أو تعديلها.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {grades.reportCards.length === 0 ? (
              <EmptyState
                title="لا توجد بطاقات تقييم"
                description="لم يتم إنشاء بطاقة تقييم ضمن هذا النطاق بعد."
              />
            ) : (
              grades.reportCards.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{item.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.academic_year_name ?? "عام غير متوفر"}
                        {item.term_name ? ` - ${item.term_name}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={REPORT_CARD_STATUS_TONES[item.status]}>
                      {REPORT_CARD_STATUS_LABELS_AR[item.status]}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-sm">
                      النسبة الإجمالية:{" "}
                      {formatNumber(item.summary.overall?.percentage ?? null)}
                    </Badge>
                  </div>
                  {item.teacher_remarks ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.teacher_remarks}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  )
}
