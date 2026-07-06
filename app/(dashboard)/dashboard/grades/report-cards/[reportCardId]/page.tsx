import Link from "next/link"
import { FileText, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { requireGradesContext } from "@/lib/grades/context"
import { getReportCardById } from "@/lib/grades/report-cards"
import type { BasicReportCardSummary } from "@/types/grades"
import {
  REPORT_CARD_STATUS_LABELS_AR,
  REPORT_CARD_STATUS_TONES,
} from "@/types/grades"
import { PublishReportCardForm } from "../../_components/grades-forms"

const gradesReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function readSummary(value: unknown): BasicReportCardSummary {
  if (!value || typeof value !== "object") {
    return { subjects: [] }
  }

  const candidate = value as Partial<BasicReportCardSummary>

  return {
    subjects: Array.isArray(candidate.subjects) ? candidate.subjects : [],
    overall: candidate.overall,
  }
}

type ReportCardDetailsPageProps = {
  params: Promise<{
    reportCardId: string
  }>
}

export default async function ReportCardDetailsPage({
  params,
}: ReportCardDetailsPageProps) {
  const { reportCardId } = await params
  const contextResult = await requireGradesContext(gradesReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل تقرير الدرجات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى التقرير"
          description={contextResult.error}
        />
      </div>
    )
  }

  let reportCard
  try {
    reportCard = await getReportCardById(contextResult.data, reportCardId)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل تقرير الدرجات" />
        <EmptyState
          icon={ShieldAlert}
          title="التقرير غير متاح"
          description="تعذر العثور على التقرير داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const summary = readSummary(reportCard.summary)
  const canPublish =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تفاصيل تقرير الدرجات"
        description="عرض لقطة التقرير الأساسية المخزنة دون توليد PDF في هذه المرحلة."
        actions={
          <>
            <Link
              href={appRoutes.reportCards}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              العودة للتقارير
            </Link>
            {canPublish ? <PublishReportCardForm reportCard={reportCard} /> : null}
          </>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>
                {reportCard.students?.full_name ?? "طالب غير معروف"}
              </CardTitle>
              <CardDescription>
                {reportCard.students?.student_number ?? "بدون رقم"} -{" "}
                {reportCard.classes?.name ?? "شعبة غير معروفة"}
              </CardDescription>
            </div>
            <StatusBadge status={REPORT_CARD_STATUS_TONES[reportCard.status]}>
              {REPORT_CARD_STATUS_LABELS_AR[reportCard.status]}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              السنة الدراسية
            </p>
            <p className="mt-1 text-sm leading-6">
              {reportCard.academic_years?.name ?? "غير محددة"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الفصل</p>
            <p className="mt-1 text-sm leading-6">
              {reportCard.terms?.name ?? "بدون فصل"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              تاريخ التوليد
            </p>
            <p className="mt-1 text-sm leading-6">
              {formatDate(reportCard.generated_at)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              تاريخ النشر
            </p>
            <p className="mt-1 text-sm leading-6">
              {formatDate(reportCard.published_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>ملخص المواد</CardTitle>
          <CardDescription>
            المجموع والنسبة من الدرجات المدخلة والمنشورة فقط.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {summary.subjects.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="لا توجد درجات في التقرير"
              description="يمكن إعادة توليد التقرير بعد إدخال نتائج أو درجات يومية للطالب."
            />
          ) : (
            summary.subjects.map((subject) => (
              <div
                key={subject.subject_id}
                className="grid gap-3 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-4"
              >
                <div>
                  <p className="text-xs font-medium text-muted-foreground">المادة</p>
                  <p className="mt-1 text-sm leading-6">{subject.subject_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    المجموع
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {subject.total_score} / {subject.max_score}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    النسبة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {subject.percentage === null ? "غير متاحة" : `${subject.percentage}%`}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الإجمالي</CardDescription>
            <CardTitle>
              {summary.overall
                ? `${summary.overall.total_score} / ${summary.overall.max_score}`
                : "غير متاح"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>النسبة العامة</CardDescription>
            <CardTitle>
              {summary.overall?.percentage === null ||
              summary.overall?.percentage === undefined
                ? "غير متاحة"
                : `${summary.overall.percentage}%`}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>مولد التقرير</CardDescription>
            <CardTitle>{reportCard.user_profiles?.full_name ?? "غير محدد"}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>ملاحظات المعلم</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">
              {reportCard.teacher_remarks ?? "لا توجد ملاحظات."}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>ملاحظات إدارية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">
              {reportCard.admin_notes ?? "لا توجد ملاحظات."}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
