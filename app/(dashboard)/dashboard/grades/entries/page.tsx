import { ClipboardList, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import {
  listAcademicYears,
  listClasses,
  listEnrollableStudents,
  listSubjects,
  listTerms,
} from "@/lib/academic/academic-structure"
import { requireGradesContext } from "@/lib/grades/context"
import { listGradeEntries } from "@/lib/grades/grade-entries"
import {
  GRADE_ENTRY_CATEGORY_LABELS_AR,
  GRADE_ENTRY_STATUS_LABELS_AR,
  GRADE_ENTRY_STATUS_TONES,
} from "@/types/grades"
import { GradeEntryForm } from "../_components/grades-forms"

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

export default async function GradeEntriesPage() {
  const contextResult = await requireGradesContext(gradesReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الدرجات اليومية" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الدرجات اليومية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, classes, subjects, students, terms, entries] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listClasses(contextResult.data),
      listSubjects(contextResult.data),
      listEnrollableStudents(contextResult.data),
      listTerms(contextResult.data),
      listGradeEntries(contextResult.data),
    ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الدرجات اليومية"
        description="إدخال واجبات ومشاريع ومشاركات منفصلة عن الاختبارات."
      />

      <GradeEntryForm
        academicYears={academicYears}
        classes={classes}
        subjects={subjects}
        students={students}
        terms={terms}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="لا توجد درجات بعد"
          description="عند حفظ أول درجة يومية ستظهر هنا."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{entry.title}</CardTitle>
                    <CardDescription>
                      {entry.students?.full_name ?? "طالب غير معروف"} -{" "}
                      {entry.subjects?.name ?? "مادة غير معروفة"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={GRADE_ENTRY_STATUS_TONES[entry.status]}>
                    {GRADE_ENTRY_STATUS_LABELS_AR[entry.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    التصنيف
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {GRADE_ENTRY_CATEGORY_LABELS_AR[entry.category]}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الدرجة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {Number(entry.score)} / {Number(entry.max_score)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الشعبة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {entry.classes?.name ?? "غير محددة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ التسجيل
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(entry.recorded_on)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
