import Link from "next/link"
import { LibraryBig, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormSheet } from "@/components/shared/form-sheet"
import { PageHeader } from "@/components/shared/page-header"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SheetClose } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listBookCatalog } from "@/lib/library/catalog"
import { requireLibraryContext } from "@/lib/library/context"
import {
  BOOK_CATALOG_STATUS_LABELS_AR,
  BOOK_CATALOG_STATUS_TONES,
} from "@/types/library"
import { BookCatalogForm } from "../_components/library-forms"

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
    <PageShell>
      <PageHeader
        title="فهرس الكتب"
        description="إدارة السجلات الببليوغرافية للكتب وربطها بالنسخ الفعلية."
        actions={
          canManage ? (
            <>
              <FormSheet
                trigger={<Button size="lg" />}
                triggerLabel="إضافة كتاب"
                title="إضافة كتاب"
                description="أضف سجلًا جديدًا إلى الفهرس مع بقائك في صفحة الكتب."
                width="xl"
              >
                <BookCatalogForm
                  surface="plain"
                  cancelSlot={
                    <SheetClose render={<Button variant="outline" type="button" />}>
                      إلغاء
                    </SheetClose>
                  }
                />
              </FormSheet>
              <Link
                href={appRoutes.newLibraryCatalog}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                فتح الصفحة الكاملة
              </Link>
            </>
          ) : null
        }
      />

      <PageSection
        title="قائمة الكتب"
        description="يبقى العرض الكامل هنا مناسبًا للمراجعة الكثيفة، بينما أصبحت إضافة الكتب متاحة كنموذج سريع داخل الصفحة."
      >
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>الكتب</CardTitle>
            <CardDescription>
              يعرض الجدول عدد النسخ الإجمالي والمتاح لكل كتاب.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {catalog.length === 0 ? (
              <EmptyState
                icon={LibraryBig}
                title="لا توجد كتب بعد"
                description="ابدأ بإضافة سجل كتاب جديد، ثم أضف النسخ الفعلية المرتبطة به ليظهر المخزون هنا."
              />
            ) : (
              <Table className="min-w-[760px] text-sm">
                <TableHeader className="text-muted-foreground">
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>المؤلف</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>النسخ</TableHead>
                    <TableHead>المتاح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalog.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={appRoutes.libraryCatalogDetails(item.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.author ?? "غير محدد"}
                      </TableCell>
                      <TableCell className="text-muted-foreground" dir="ltr">
                        {item.isbn ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.category ?? "غير مصنف"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={BOOK_CATALOG_STATUS_TONES[item.status]}>
                          {BOOK_CATALOG_STATUS_LABELS_AR[item.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{item.copies_count}</TableCell>
                      <TableCell>{item.available_copies_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  )
}
