import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { requireAttendanceContext } from "@/lib/attendance/context"
import {
  listAcademicYears,
  listClasses,
  listTerms,
} from "@/lib/academic/academic-structure"
import { AttendanceSessionForm } from "../../_components/attendance-forms"

const attendanceMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function NewAttendanceSessionPage() {
  const contextResult = await requireAttendanceContext(attendanceMutationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="جلسة حضور جديدة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إنشاء جلسة حضور"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, classes, terms] = await Promise.all([
    listAcademicYears(contextResult.data),
    listClasses(contextResult.data),
    listTerms(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="جلسة حضور جديدة"
        description="اختر السنة والشعبة، ثم سجل الحضور يدويًا أو عبر رمز الطالب."
        actions={
          <Link
            href={appRoutes.attendanceSessions}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            العودة للجلسات
          </Link>
        }
      />
      <AttendanceSessionForm
        academicYears={academicYears}
        classes={classes}
        terms={terms}
      />
    </div>
  )
}
