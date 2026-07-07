import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { USER_ROLES } from "@/constants/roles"
import { listBookCatalogOptions } from "@/lib/library/catalog"
import { requireLibraryContext } from "@/lib/library/context"
import { BookCopyForm } from "../../_components/library-forms"

const libraryMutationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
] as const

export default async function NewLibraryCopyPage() {
  const contextResult = await requireLibraryContext(libraryMutationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إضافة نسخة كتاب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن إضافة نسخة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const catalogOptions = await listBookCatalogOptions(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إضافة نسخة كتاب"
        description="اختر كتابًا نشطًا من الفهرس ثم أدخل بيانات النسخة الفعلية."
      />
      <BookCopyForm catalogOptions={catalogOptions} />
    </div>
  )
}
