import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { requireStudentContext } from "@/lib/students/context"
import { AdmissionForm } from "./admission-form"

const admissionCreateRoles = [
  USER_ROLES.PARENT,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
] as const

export default async function NewAdmissionPage() {
  const contextResult = await requireStudentContext(admissionCreateRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="طلب قبول جديد"
          description="إدخال البيانات الأساسية للطالب وولي الأمر ضمن المدرسة الحالية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إنشاء طلب قبول"
          description={contextResult.error}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="طلب قبول جديد"
        description="هذا النموذج يربط الطلب تلقائيًا بسياق المدرسة الحالية، ولا يقبل أي قيمة tenant أو school من الواجهة."
      />
      <AdmissionForm />
    </div>
  )
}
