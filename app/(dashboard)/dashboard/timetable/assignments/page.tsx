import { ShieldAlert, UserCheck } from "lucide-react"

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
  listGradeLevels,
  listSubjects,
} from "@/lib/academic/academic-structure"
import { requireTimetableContext } from "@/lib/timetable/context"
import {
  listTeacherOptions,
  listTeacherSubjectAssignments,
} from "@/lib/timetable/teacher-subject-assignments"
import {
  TEACHER_SUBJECT_ASSIGNMENT_STATUS_LABELS_AR,
  TEACHER_SUBJECT_ASSIGNMENT_STATUS_TONES,
} from "@/types/timetable"
import { TeacherSubjectAssignmentForm } from "../_components/timetable-forms"

const timetableReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function TimetableAssignmentsPage() {
  const contextResult = await requireTimetableContext(timetableReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تكليفات المعلمين" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تكليفات المعلمين"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [
    academicYears,
    classes,
    gradeLevels,
    subjects,
    teachers,
    assignments,
  ] = await Promise.all([
    listAcademicYears(contextResult.data),
    listClasses(contextResult.data),
    listGradeLevels(contextResult.data),
    listSubjects(contextResult.data),
    listTeacherOptions(contextResult.data),
    listTeacherSubjectAssignments(contextResult.data),
  ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const yearById = new Map(academicYears.map((year) => [year.id, year]))
  const classById = new Map(classes.map((classSection) => [classSection.id, classSection]))
  const gradeLevelById = new Map(
    gradeLevels.map((gradeLevel) => [gradeLevel.id, gradeLevel])
  )
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))
  const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تكليفات المعلمين"
        description="حدد من يدرّس المادة لصف أو شعبة قبل إدخال الحصص في الجدول."
      />

      {canMutate ? (
        <TeacherSubjectAssignmentForm
          academicYears={academicYears}
          teachers={teachers}
          subjects={subjects}
          gradeLevels={gradeLevels}
          classes={classes}
        />
      ) : null}

      {assignments.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="لا توجد تكليفات بعد"
          description="أضف تكليفًا لمعلم نشط قبل إنشاء حصة جدول لهذا المعلم."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>
                      {teacherById.get(assignment.teacher_user_id)?.display_name ??
                        teacherById.get(assignment.teacher_user_id)?.full_name ??
                        "معلم غير معروف"}
                    </CardTitle>
                    <CardDescription>
                      {subjectById.get(assignment.subject_id)?.name ?? "مادة غير معروفة"}
                    </CardDescription>
                  </div>
                  <StatusBadge
                    status={
                      TEACHER_SUBJECT_ASSIGNMENT_STATUS_TONES[assignment.status]
                    }
                  >
                    {TEACHER_SUBJECT_ASSIGNMENT_STATUS_LABELS_AR[assignment.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    السنة الدراسية
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {yearById.get(assignment.academic_year_id)?.name ?? "غير محددة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">النطاق</p>
                  <p className="mt-1 text-sm leading-6">
                    {assignment.class_id
                      ? classById.get(assignment.class_id)?.name ?? "شعبة غير معروفة"
                      : gradeLevelById.get(assignment.grade_level_id ?? "")?.name ??
                        "صف غير معروف"}
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
