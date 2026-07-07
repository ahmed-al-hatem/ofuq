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
import { listBookCatalog } from "@/lib/library/catalog"
import { requireLibraryContext } from "@/lib/library/context"
import {
  BOOK_CATALOG_STATUS_LABELS_AR,
  BOOK_CATALOG_STATUS_TONES,
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

export default async function LibraryCatalogPage() {
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="فهرس الكتب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى فهرس الكتب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const catalog = await listBookCatalog(contextResult.data)
  const canManage = canManageLibrary(contextResult.data.role)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="فهرس الكتب"
        description="إدارة السجلات الببليوغرافية للكتب وربطها بالنسخ الفعلية."
        actions={
          canManage ? (
            <Link
              href={appRoutes.newLibraryCatalog}
              className={buttonVariants({ size: "lg" })}
            >
              إضافة كتاب
            </Link>
          ) : null
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الكتب</CardTitle>
          <CardDescription>
            يعرض الجدول عدد النسخ الإجمالي والمتاح لكل كتاب.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {catalog.length === 0 ? (
            <EmptyState
              icon={LibraryBig}
              title="لا توجد كتب بعد"
              description="ابدأ بإضافة سجل كتاب ثم أضف النسخ الفعلية المرتبطة به."
            />
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">العنوان</th>
                  <th className="py-3 text-start font-medium">المؤلف</th>
                  <th className="py-3 text-start font-medium">ISBN</th>
                  <th className="py-3 text-start font-medium">التصنيف</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">النسخ</th>
                  <th className="py-3 text-start font-medium">المتاح</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((item) => (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="py-3">
                      <Link
                        href={appRoutes.libraryCatalogDetails(item.id)}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {item.author ?? "غير محدد"}
                    </td>
                    <td className="py-3 text-muted-foreground" dir="ltr">
                      {item.isbn ?? "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {item.category ?? "غير مصنف"}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={BOOK_CATALOG_STATUS_TONES[item.status]}>
                        {BOOK_CATALOG_STATUS_LABELS_AR[item.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3">{item.copies_count}</td>
                    <td className="py-3">{item.available_copies_count}</td>
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
