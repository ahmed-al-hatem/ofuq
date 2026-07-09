import Link from "next/link"
import { BookCopy, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormDialog } from "@/components/shared/form-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DialogClose } from "@/components/ui/dialog"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listBookCatalogOptions } from "@/lib/library/catalog"
import { listBookCopies } from "@/lib/library/copies"
import { requireLibraryContext } from "@/lib/library/context"
import {
  BOOK_COPY_CONDITION_LABELS_AR,
  BOOK_COPY_CONDITION_TONES,
  BOOK_COPY_STATUS_LABELS_AR,
  BOOK_COPY_STATUS_TONES,
} from "@/types/library"
import { BookCopyForm, BookCopyStatusActions } from "../_components/library-forms"

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

export default async function LibraryCopiesPage() {
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="نسخ الكتب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى نسخ الكتب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canManage = canManageLibrary(contextResult.data.role)
  const [copies, catalogOptions] = await Promise.all([
    listBookCopies(contextResult.data),
    canManage ? listBookCatalogOptions(contextResult.data) : Promise.resolve([]),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="نسخ الكتب"
        description="كل نسخة تمثل كتابًا فعليًا يمكن إعارته أو تعليمه كمفقود أو تالف."
        actions={
          canManage ? (
            <>
              <FormDialog
                trigger={<Button size="lg" />}
                triggerLabel="إضافة نسخة"
                title="إضافة نسخة كتاب"
                description="نموذج سريع لإضافة نسخة فعلية جديدة من كتاب موجود في الفهرس."
                size="lg"
              >
                <BookCopyForm
                  catalogOptions={catalogOptions}
                  surface="plain"
                  cancelSlot={
                    <DialogClose render={<Button variant="outline" type="button" />}>
                      إلغاء
                    </DialogClose>
                  }
                />
              </FormDialog>
              <Link
                href={appRoutes.newLibraryCopy}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                فتح الصفحة الكاملة
              </Link>
            </>
          ) : null
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>النسخ</CardTitle>
          <CardDescription>
            الباركود هنا نص يدوي فقط، ولا يوجد تكامل قارئ باركود في هذه المرحلة.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {copies.length === 0 ? (
            <EmptyState
              icon={BookCopy}
              title="لا توجد نسخ بعد"
              description="أضف كتابًا إلى الفهرس ثم أضف نسخة فعلية قابلة للإعارة."
            />
          ) : (
            <table className="w-full min-w-[860px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الكتاب</th>
                  <th className="py-3 text-start font-medium">الباركود</th>
                  <th className="py-3 text-start font-medium">رقم القيد</th>
                  <th className="py-3 text-start font-medium">الرف</th>
                  <th className="py-3 text-start font-medium">حالة النسخة</th>
                  <th className="py-3 text-start font-medium">الوضع</th>
                  {canManage ? (
                    <th className="py-3 text-start font-medium">إجراءات</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {copies.map((copy) => (
                  <tr key={copy.id} className="border-b border-border/60">
                    <td className="py-3 font-medium">
                      {copy.book_catalog?.title ?? "كتاب غير معروف"}
                    </td>
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
                    {canManage ? (
                      <td className="py-3">
                        <BookCopyStatusActions copyId={copy.id} />
                      </td>
                    ) : null}
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
