import { ShieldAlert, UsersRound } from "lucide-react"

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
  listClassEnrollments,
  listClasses,
  listEnrollableStudents,
} from "@/lib/academic/academic-structure"
import {
  CLASS_ENROLLMENT_STATUS_LABELS_AR,
  CLASS_ENROLLMENT_STATUS_TONES,
} from "@/types/academic"
import { EnrollmentForm } from "../_components/academic-forms"

const academicReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function ClassEnrollmentsPage() {
  const contextResult = await requireAcademicContext(academicReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="تسجيلات الطلاب"
          description="تسجيل الطلاب في الشعب للسنة الدراسية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تسجيلات الطلاب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, classes, students, enrollments] = await Promise.all([
    listAcademicYears(contextResult.data),
    listClasses(contextResult.data),
    listEnrollableStudents(contextResult.data),
    listClassEnrollments(contextResult.data),
  ])
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const academicYearById = new Map(
    academicYears.map((academicYear) => [academicYear.id, academicYear])
  )
  const classById = new Map(classes.map((classSection) => [classSection.id, classSection]))
  const studentById = new Map(students.map((student) => [student.id, student]))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تسجيلات الطلاب"
        description="تسجيل الطالب في شعبة يتم بعد تحقق الخادم من ملكية الطالب والشعبة والسنة الدراسية داخل المدرسة الحالية."
      />

      {canMutate ? (
        <EnrollmentForm
          academicYears={academicYears}
          classes={classes}
          students={students}
        />
      ) : null}

      {enrollments.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="لا توجد تسجيلات بعد"
          description="عند تسجيل أول طالب في شعبة سيظهر هنا مع السنة الدراسية وحالة التسجيل."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>
                      {studentById.get(enrollment.student_id)?.full_name ??
                        "طالب غير معروف"}
                    </CardTitle>
                    <CardDescription>
                      {classById.get(enrollment.class_id)?.name ?? "شعبة غير معروفة"}
                    </CardDescription>
                  </div>
                  <StatusBadge
                    status={CLASS_ENROLLMENT_STATUS_TONES[enrollment.status]}
                  >
                    {CLASS_ENROLLMENT_STATUS_LABELS_AR[enrollment.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    السنة الدراسية
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {academicYearById.get(enrollment.academic_year_id)?.name ??
                      "سنة غير معروفة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ التسجيل
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(enrollment.enrolled_on)}
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
