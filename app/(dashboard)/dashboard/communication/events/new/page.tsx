import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { listClasses, listGradeLevels } from "@/lib/academic/academic-structure"
import { requireCommunicationContext } from "@/lib/communication/context"
import { SchoolEventForm } from "@/app/(dashboard)/dashboard/communication/_components/communication-forms"

const managementRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

export default async function NewCommunicationEventPage() {
  const contextResult = await requireCommunicationContext(managementRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="حدث جديد" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إنشاء حدث"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [gradeLevels, classes] = await Promise.all([
    listGradeLevels(contextResult.data),
    listClasses(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="حدث جديد"
        description="أضف حدثًا مدرسيًا بسيطًا وموجهًا داخل المدرسة الحالية."
      />
      <SchoolEventForm gradeLevels={gradeLevels} classes={classes} />
    </div>
  )
}
