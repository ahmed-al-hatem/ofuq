import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { requireLibraryContext } from "@/lib/library/context"
import { listAvailableBookCopyOptions } from "@/lib/library/copies"
import { listStudents } from "@/lib/students/students"
import { IssueBookLoanForm } from "../../_components/library-forms"

const libraryMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
] as const

export default async function NewLibraryLoanPage() {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إعارة كتاب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إنشاء إعارة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [copyOptions, students] = await Promise.all([
    listAvailableBookCopyOptions(contextResult.data),
    listStudents(contextResult.data),
  ])
  const activeStudents = students.filter((student) => student.status === "active")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إعارة كتاب"
        description="اختر نسخة متاحة وطالبًا نشطًا، ثم حدد تاريخ الاستحقاق."
      />
      <IssueBookLoanForm copyOptions={copyOptions} students={activeStudents} />
    </div>
  )
}
