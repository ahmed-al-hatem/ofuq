import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { requireCommunicationContext } from "@/lib/communication/context"
import { listMessageRecipientOptions } from "@/lib/communication/messages"
import { listStudents } from "@/lib/students/students"
import { MessageForm } from "@/app/(dashboard)/dashboard/communication/_components/communication-forms"

const messagingRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

export default async function NewCommunicationMessagePage() {
  const contextResult = await requireCommunicationContext(messagingRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="رسالة جديدة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إرسال رسالة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [recipients, students] = await Promise.all([
    listMessageRecipientOptions(contextResult.data),
    listStudents(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="رسالة جديدة"
        description="أرسل رسالة داخلية لمستخدمين لديهم عضوية نشطة في المدرسة الحالية."
      />
      <MessageForm recipients={recipients} students={students} />
    </div>
  )
}
