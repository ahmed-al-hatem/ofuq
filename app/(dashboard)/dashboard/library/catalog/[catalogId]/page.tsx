import Link from "next/link"
import { LibraryBig, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { loadBookCatalogDetail } from "@/lib/library/catalog"
import { requireLibraryContext } from "@/lib/library/context"
import {
  BOOK_CATALOG_STATUS_LABELS_AR,
  BOOK_CATALOG_STATUS_TONES,
  BOOK_COPY_CONDITION_LABELS_AR,
  BOOK_COPY_CONDITION_TONES,
  BOOK_COPY_STATUS_LABELS_AR,
  BOOK_COPY_STATUS_TONES,
} from "@/types/library"

const libraryReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
] as const

function canManageLibrary(role: string) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN ||
    role === USER_ROLES.SCHOOL_ADMIN ||
    role === USER_ROLES.LIBRARIAN
  )
}

export default async function LibraryCatalogDetailsPage({
  params,
}: {
  params: Promise<{ catalogId: string }>
}) {
  const { catalogId } = await params
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الكتاب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الكتاب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const detail = await loadBookCatalogDetail(contextResult.data, catalogId)

  if (!detail) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الكتاب" />
        <EmptyState
          icon={LibraryBig}
          title="الكتاب غير موجود"
          description="تعذر العثور على الكتاب داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const canManage = canManageLibrary(contextResult.data.role)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={detail.catalog.title}
        description={detail.catalog.author ?? "مؤلف غير محدد"}
        actions={
          <>
            <Link
              href={appRoutes.libraryCatalog}
              className={buttonVariants({ variant: "outline" })}
            >
              العودة للفهرس
            </Link>
            {canManage ? (
              <Link href={appRoutes.newLibraryCopy} className={buttonVariants()}>
                إضافة نسخة
              </Link>
            ) : null}
          </>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>بيانات الفهرس</CardTitle>
              <CardDescription>
                {detail.catalog.category ?? "غير مصنف"} -{" "}
                {detail.catalog.language ?? "ar"}
              </CardDescription>
            </div>
            <StatusBadge status={BOOK_CATALOG_STATUS_TONES[detail.catalog.status]}>
              {BOOK_CATALOG_STATUS_LABELS_AR[detail.catalog.status]}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">ISBN</p>
            <p className="mt-1 text-sm leading-6" dir="ltr">
              {detail.catalog.isbn ?? "غير محدد"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الناشر</p>
            <p className="mt-1 text-sm leading-6">
              {detail.catalog.publisher ?? "غير محدد"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">سنة النشر</p>
            <p className="mt-1 text-sm leading-6">
              {detail.catalog.publication_year ?? "غير محددة"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-3">
            <p className="text-xs font-medium text-muted-foreground">الوصف</p>
            <p className="mt-1 text-sm leading-6">
              {detail.catalog.description ?? "لا يوجد وصف."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>النسخ المرتبطة</CardTitle>
          <CardDescription>نسخ هذا الكتاب ومواقعها وحالاتها.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {detail.copies.length === 0 ? (
            <EmptyState
              icon={LibraryBig}
              title="لا توجد نسخ"
              description="أضف نسخة فعلية حتى يصبح الكتاب قابلًا للإعارة."
            />
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الباركود</th>
                  <th className="py-3 text-start font-medium">رقم القيد</th>
                  <th className="py-3 text-start font-medium">الرف</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">الوضع</th>
                </tr>
              </thead>
              <tbody>
                {detail.copies.map((copy) => (
                  <tr key={copy.id} className="border-b border-border/60">
                    <td className="py-3 text-muted-foreground" dir="ltr">
                      {copy.barcode ?? "-"}
                    </td>
                    <td className="py-3 text-muted-foreground" dir="ltr">
                      {copy.accession_number ?? "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {copy.shelf_location ?? "غير محدد"}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={BOOK_COPY_CONDITION_TONES[copy.condition]}>
                        {BOOK_COPY_CONDITION_LABELS_AR[copy.condition]}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={BOOK_COPY_STATUS_TONES[copy.status]}>
                        {BOOK_COPY_STATUS_LABELS_AR[copy.status]}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
