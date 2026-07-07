import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { requireStudentCareContext, listStudentCareStudents } from "@/lib/student-care/context"
import { ClinicVisitForm } from "../../_components/student-care-forms"

const studentCareAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

export default async function NewStudentCareClinicVisitPage() {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="زيارة عيادة جديدة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إضافة زيارة عيادة"
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
        title="زيارة عيادة جديدة"
        description="تسجيل زيارة صحية مدرسية بسيطة لطالب نشط داخل المدرسة الحالية."
      />
      <ClinicVisitForm students={students} />
    </div>
  )
}
