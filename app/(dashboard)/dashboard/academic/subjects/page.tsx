import { BookOpen, ShieldAlert } from "lucide-react"

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
import { requireAcademicContext } from "@/lib/academic/context"
import {
  listAcademicYears,
  listGradeLevels,
  listGradeLevelSubjects,
  listSubjects,
} from "@/lib/academic/academic-structure"
import {
  SUBJECT_STATUS_LABELS_AR,
  SUBJECT_STATUS_TONES,
  SUBJECT_TYPE_LABELS_AR,
} from "@/types/academic"
import {
  GradeLevelSubjectForm,
  SubjectForm,
} from "../_components/academic-forms"

const academicReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function SubjectsPage() {
  const contextResult = await requireAcademicContext(academicReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="المواد"
          description="تعريف المواد وربطها بالصفوف الدراسية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى المواد"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, gradeLevels, subjects, assignments] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listGradeLevels(contextResult.data),
      listSubjects(contextResult.data),
      listGradeLevelSubjects(contextResult.data),
    ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const academicYearById = new Map(
    academicYears.map((academicYear) => [academicYear.id, academicYear])
  )
  const gradeLevelById = new Map(
    gradeLevels.map((gradeLevel) => [gradeLevel.id, gradeLevel])
  )
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المواد"
        description="المواد والربط مع الصفوف يجهزان البيانات للدرجات والجداول لاحقًا دون تنفيذها الآن."
      />

      {canMutate ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <SubjectForm />
          <GradeLevelSubjectForm
            academicYears={academicYears}
            gradeLevels={gradeLevels}
            subjects={subjects}
          />
        </section>
      ) : null}

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا توجد مواد بعد"
          description="أضف المواد الأساسية أولًا، ثم اربطها بالصفوف حسب السنة الدراسية."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription dir="ltr">{subject.code}</CardDescription>
                  </div>
                  <StatusBadge status={SUBJECT_STATUS_TONES[subject.status]}>
                    {SUBJECT_STATUS_LABELS_AR[subject.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    النوع
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {SUBJECT_TYPE_LABELS_AR[subject.subject_type]}
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {subject.description ?? "لا يوجد وصف للمادة."}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">ربط المواد بالصفوف</h2>
        {assignments.length === 0 ? (
          <EmptyState
            title="لا توجد مواد مرتبطة بصفوف بعد"
            description="بعد إنشاء المواد والصفوف، اربط المادة بالصف والسنة الدراسية المناسبة."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>
                    {subjectById.get(assignment.subject_id)?.name ?? "مادة غير معروفة"}
                  </CardTitle>
                  <CardDescription>
                    {gradeLevelById.get(assignment.grade_level_id)?.name ??
                      "صف غير معروف"}{" "}
                    -{" "}
                    {academicYearById.get(assignment.academic_year_id)?.name ??
                      "سنة غير معروفة"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      إلزامية
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {assignment.is_required ? "نعم" : "لا"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      حصص أسبوعية
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {assignment.weekly_periods ?? "غير محددة"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      ترتيب العرض
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {assignment.sort_order}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
