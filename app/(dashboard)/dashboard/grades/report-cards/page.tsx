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
import {
  listAcademicYears,
  listClasses,
  listEnrollableStudents,
  listTerms,
} from "@/lib/academic/academic-structure"
import { requireGradesContext } from "@/lib/grades/context"
import { listReportCards } from "@/lib/grades/report-cards"
import {
  REPORT_CARD_STATUS_LABELS_AR,
  REPORT_CARD_STATUS_TONES,
} from "@/types/grades"
import { ReportCardGenerateForm } from "../_components/grades-forms"

const gradesReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function ReportCardsPage() {
  const contextResult = await requireGradesContext(gradesReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تقارير الدرجات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تقارير الدرجات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, classes, students, terms, reportCards] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listClasses(contextResult.data),
      listEnrollableStudents(contextResult.data),
      listTerms(contextResult.data),
      listReportCards(contextResult.data),
    ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تقارير الدرجات"
        description="توليد وعرض تقرير أساسي لكل طالب من نتائج الاختبارات والدرجات اليومية."
      />

      <ReportCardGenerateForm
        academicYears={academicYears}
        classes={classes}
        students={students}
        terms={terms}
      />

      {reportCards.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="لا توجد تقارير بعد"
          description="يمكن توليد تقرير بعد توفر طالب مسجل ودرجات مرتبطة به."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {reportCards.map((reportCard) => (
            <Card key={reportCard.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>
                      {reportCard.students?.full_name ?? "طالب غير معروف"}
                    </CardTitle>
                    <CardDescription>
                      {reportCard.classes?.name ?? "شعبة غير معروفة"} -{" "}
                      {reportCard.academic_years?.name ?? "سنة غير معروفة"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={REPORT_CARD_STATUS_TONES[reportCard.status]}>
                    {REPORT_CARD_STATUS_LABELS_AR[reportCard.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
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
                <Link
                  href={appRoutes.reportCardDetails(reportCard.id)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  عرض التقرير
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
