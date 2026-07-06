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
import { getExamById, loadExamStudents } from "@/lib/grades/exams"
import { listExamResultsForExam } from "@/lib/grades/exam-results"
import {
  EXAM_RESULT_STATUS_LABELS_AR,
  EXAM_RESULT_STATUS_TONES,
  EXAM_STATUS_LABELS_AR,
  EXAM_STATUS_TONES,
} from "@/types/grades"
import {
  ExamResultForm,
  PublishExamResultsForm,
} from "../../_components/grades-forms"

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

type ExamDetailsPageProps = {
  params: Promise<{
    examId: string
  }>
}

export default async function ExamDetailsPage({ params }: ExamDetailsPageProps) {
  const { examId } = await params
  const contextResult = await requireGradesContext(gradesReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الاختبار" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الاختبار"
          description={contextResult.error}
        />
      </div>
    )
  }

  let exam
  try {
    exam = await getExamById(contextResult.data, examId)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الاختبار" />
        <EmptyState
          icon={ShieldAlert}
          title="الاختبار غير متاح"
          description="تعذر العثور على الاختبار داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const [students, results] = await Promise.all([
    loadExamStudents(contextResult.data, exam.id),
    listExamResultsForExam(contextResult.data, exam.id),
  ])
  const resultsByStudentId = new Map(
    results.map((result) => [result.student_id, result])
  )
  const canPublish =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تفاصيل الاختبار"
        description="إدخال النتائج يتم لكل طالب مسجل نشطًا في شعبة الاختبار."
        actions={
          <>
            <Link
              href={appRoutes.gradesExams}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              العودة للاختبارات
            </Link>
            {canPublish ? <PublishExamResultsForm examId={exam.id} /> : null}
          </>
        }
      />

      <Card className="border-border/70 shadow-sm">
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
        <CardContent className="grid gap-3 md:grid-cols-4">
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
            <p className="mt-1 text-sm leading-6">{Number(exam.max_score)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>نتائج الطلاب</CardTitle>
          <CardDescription>
            يحفظ الخادم `class_enrollment_id` بعد التحقق من التسجيل النشط.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {students.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="لا يوجد طلاب مسجلون"
              description="تحتاج الشعبة إلى طلاب مسجلين نشطًا قبل إدخال النتائج."
            />
          ) : (
            students.map((enrollment) => {
              const result = resultsByStudentId.get(enrollment.student_id)

              return (
                <div
                  key={enrollment.id}
                  className="grid gap-3 rounded-2xl border border-border/60 bg-background p-4 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)]"
                >
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="font-medium">
                        {enrollment.student?.full_name ?? "طالب غير معروف"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.student?.student_number ?? "بدون رقم"}
                      </p>
                    </div>
                    {result ? (
                      <StatusBadge status={EXAM_RESULT_STATUS_TONES[result.status]}>
                        {EXAM_RESULT_STATUS_LABELS_AR[result.status]}
                      </StatusBadge>
                    ) : (
                      <StatusBadge>لم تدخل النتيجة</StatusBadge>
                    )}
                  </div>
                  <ExamResultForm
                    examId={exam.id}
                    studentId={enrollment.student_id}
                    defaultScore={
                      result ? (result.score === null ? null : Number(result.score)) : null
                    }
                    defaultStatus={result?.status ?? "entered"}
                  />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
