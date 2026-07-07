import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { requireLibraryContext } from "@/lib/library/context"
import { BookCatalogForm } from "../../_components/library-forms"

const libraryMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
] as const

export default async function NewLibraryCatalogPage() {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إضافة كتاب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إضافة كتاب"
          description={contextResult.error}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إضافة كتاب"
        description="أدخل بيانات الفهرس الأساسية. النسخ الفعلية تضاف في خطوة منفصلة."
      />
      <BookCatalogForm />
    </div>
  )
}
