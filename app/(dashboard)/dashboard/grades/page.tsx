import Link from "next/link"
import { BookOpenCheck, ShieldAlert } from "lucide-react"

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
import { countExams, listExams } from "@/lib/grades/exams"
import { listGradeEntries } from "@/lib/grades/grade-entries"
import { listReportCards } from "@/lib/grades/report-cards"
import {
  EXAM_STATUS_LABELS_AR,
  EXAM_STATUS_TONES,
  GRADE_ENTRY_CATEGORY_LABELS_AR,
  REPORT_CARD_STATUS_LABELS_AR,
  REPORT_CARD_STATUS_TONES,
} from "@/types/grades"

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

export default async function GradesOverviewPage() {
  const contextResult = await requireGradesContext(gradesReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الدرجات والتقارير"
          description="إدارة الاختبارات والدرجات وتوليد تقارير الطلاب الأساسية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى وحدة الدرجات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [totalExams, recentExams, recentEntries, recentReportCards] =
    await Promise.all([
      countExams(contextResult.data),
      listExams(contextResult.data, 4),
      listGradeEntries(contextResult.data, 4),
      listReportCards(contextResult.data, 4),
    ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الدرجات والتقارير"
        description="أساس عملي للاختبارات، إدخال النتائج، الدرجات اليومية، وتقرير طالب قابل للعرض."
        actions={
          <>
            <Link
              href={appRoutes.newGradesExam}
              className={buttonVariants({ size: "lg" })}
            >
              اختبار جديد
            </Link>
            <Link
              href={appRoutes.reportCards}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              التقارير
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>إجمالي الاختبارات</CardDescription>
            <CardTitle className="text-3xl">{totalExams}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={appRoutes.gradesExams}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              عرض الاختبارات
            </Link>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>درجات حديثة</CardDescription>
            <CardTitle className="text-3xl">{recentEntries.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={appRoutes.gradeEntries}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              إدخال الدرجات
            </Link>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>تقارير حديثة</CardDescription>
            <CardTitle className="text-3xl">{recentReportCards.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status="info">لقطات أساسية فقط</StatusBadge>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>أحدث الاختبارات</CardTitle>
            <CardDescription>مرتبة حسب تاريخ الإنشاء.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentExams.length === 0 ? (
              <EmptyState
                icon={BookOpenCheck}
                title="لا توجد اختبارات بعد"
                description="أنشئ اختبارًا مرتبطًا بشعبة ومادة وسنة دراسية."
              />
            ) : (
              recentExams.map((exam) => (
                <Link
                  key={exam.id}
                  href={appRoutes.gradesExamDetails(exam.id)}
                  className="rounded-2xl border border-border/60 bg-background p-4 transition hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.subjects?.name ?? "مادة غير معروفة"} -{" "}
                        {exam.classes?.name ?? "شعبة غير معروفة"}
                      </p>
                    </div>
                    <StatusBadge status={EXAM_STATUS_TONES[exam.status]}>
                      {EXAM_STATUS_LABELS_AR[exam.status]}
                    </StatusBadge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>درجات غير اختبارية</CardTitle>
            <CardDescription>واجبات ومشاركات ومشاريع.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentEntries.length === 0 ? (
              <EmptyState
                title="لا توجد درجات يومية"
                description="استخدم صفحة إدخال الدرجات لتسجيل أول درجة."
              />
            ) : (
              recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-border/60 bg-background p-4"
                >
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.students?.full_name ?? "طالب غير معروف"} -{" "}
                    {GRADE_ENTRY_CATEGORY_LABELS_AR[entry.category]}
                  </p>
                  <p className="mt-2 text-sm">
                    {Number(entry.score)} / {Number(entry.max_score)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>تقارير الطلاب</CardTitle>
            <CardDescription>آخر لقطات التقارير المولدة.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentReportCards.length === 0 ? (
              <EmptyState
                title="لا توجد تقارير بعد"
                description="يمكن توليد تقرير بعد توفر درجات للطالب."
              />
            ) : (
              recentReportCards.map((reportCard) => (
                <Link
                  key={reportCard.id}
                  href={appRoutes.reportCardDetails(reportCard.id)}
                  className="rounded-2xl border border-border/60 bg-background p-4 transition hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">
                        {reportCard.students?.full_name ?? "طالب غير معروف"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(reportCard.generated_at)}
                      </p>
                    </div>
                    <StatusBadge status={REPORT_CARD_STATUS_TONES[reportCard.status]}>
                      {REPORT_CARD_STATUS_LABELS_AR[reportCard.status]}
                    </StatusBadge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
