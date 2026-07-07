import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { requireStudentCareContext, listStudentCareStudents } from "@/lib/student-care/context"
import { AchievementForm } from "../../_components/student-care-forms"

const studentCareTeacherRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function NewStudentCareAchievementPage() {
  const contextResult = await requireStudentCareContext(studentCareTeacherRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إنجاز جديد" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إضافة الإنجاز"
          description={contextResult.error}
        />
      </div>
    )
  }

  const students = await listStudentCareStudents(contextResult.data, {
    activeOnly: true,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إنجاز جديد"
        description="سجل إنجاز الطالب كمسودة تمهيدًا للنشر الإداري داخل المدرسة الحالية."
      />
      <AchievementForm students={students} />
    </div>
  )
}
