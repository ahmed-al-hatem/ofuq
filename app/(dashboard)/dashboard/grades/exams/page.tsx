import Link from "next/link"
import { ClipboardList, ShieldAlert } from "lucide-react"

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
import { listExams } from "@/lib/grades/exams"
import { EXAM_STATUS_LABELS_AR, EXAM_STATUS_TONES } from "@/types/grades"

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

export default async function GradesExamsPage() {
  const contextResult = await requireGradesContext(gradesReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الاختبارات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الاختبارات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const exams = await listExams(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الاختبارات"
        description="اختبارات مرتبطة بالسنة والشعبة والمادة، مع إدخال نتائج لكل طالب مسجل."
        actions={
          <Link
            href={appRoutes.newGradesExam}
            className={buttonVariants({ size: "lg" })}
          >
            اختبار جديد
          </Link>
        }
      />

      {exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="لا توجد اختبارات بعد"
          description="ابدأ بإنشاء اختبار لشعبة ومادة داخل السنة الدراسية الحالية."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>
                      {exam.subjects?.name ?? "مادة غير معروفة"} -{" "}
                      {exam.classes?.name ?? "شعبة غير معروفة"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={EXAM_STATUS_TONES[exam.status]}>
                    {EXAM_STATUS_LABELS_AR[exam.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    السنة الدراسية
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {exam.academic_years?.name ?? "غير محددة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">الفصل</p>
                  <p className="mt-1 text-sm leading-6">
                    {exam.terms?.name ?? "غير محدد"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ الاختبار
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(exam.exam_date)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الدرجة العظمى
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {Number(exam.max_score)}
                  </p>
                </div>
                <Link
                  href={appRoutes.gradesExamDetails(exam.id)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح التفاصيل
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
