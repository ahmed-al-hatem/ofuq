import Link from "next/link"
import { BookOpen, ShieldAlert } from "lucide-react"

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
import { listAvailableBookCopyOptions } from "@/lib/library/copies"
import { requireLibraryContext } from "@/lib/library/context"
import { listBookLoans } from "@/lib/library/loans"
import { listStudents } from "@/lib/students/students"
import {
  BOOK_LOAN_STATUS_LABELS_AR,
  BOOK_LOAN_STATUS_TONES,
} from "@/types/library"
import { IssueBookLoanForm } from "../_components/library-forms"

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

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getCopyCode(loan: Awaited<ReturnType<typeof listBookLoans>>[number]) {
  return loan.book_copies?.barcode ?? loan.book_copies?.accession_number ?? "-"
}

export default async function LibraryLoansPage() {
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الإعارات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإعارات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canManage = canManageLibrary(contextResult.data.role)
  const [loans, copyOptions, students] = await Promise.all([
    listBookLoans(contextResult.data),
    canManage ? listAvailableBookCopyOptions(contextResult.data) : Promise.resolve([]),
    canManage ? listStudents(contextResult.data) : Promise.resolve([]),
  ])
  const activeStudents = students.filter((student) => student.status === "active")

  return (
    <PageShell>
      <PageHeader
        title="الإعارات"
        description="متابعة إعارات الطلاب النشطة والمسترجعة والمتأخرة."
        actions={
          canManage ? (
            <>
              <FormSheet
                trigger={<Button size="lg" />}
                triggerLabel="إعارة كتاب"
                title="إصدار إعارة"
                description="نموذج سريع لاختيار نسخة متاحة وطالب نشط مع البقاء في سجل الإعارات."
                width="lg"
              >
                <IssueBookLoanForm
                  copyOptions={copyOptions}
                  students={activeStudents}
                  surface="plain"
                  cancelSlot={
                    <SheetClose render={<Button variant="outline" type="button" />}>
                      إلغاء
                    </SheetClose>
                  }
                />
              </FormSheet>
              <Link
                href={appRoutes.newLibraryLoan}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                فتح الصفحة الكاملة
              </Link>
            </>
          ) : null
        }
      />

      <PageSection
        title="سجل الإعارات"
        description="احتفظنا بسجل الإعارات كصفحة كاملة قابلة للربط المباشر، مع نقل إنشاء الإعارة إلى نموذج سريع عند الحاجة."
      >
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>سجل الإعارات</CardTitle>
            <CardDescription>
              يتم احتساب التأخر من تاريخ الاستحقاق للإعارات النشطة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loans.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="لا توجد إعارات بعد"
                description="يمكن إنشاء إعارة بعد توفر نسخة كتاب وطالب نشط، أو فتح الصفحة الكاملة لإتمام الإدخال."
              />
            ) : (
              <Table className="min-w-[980px] text-sm">
                <TableHeader className="text-muted-foreground">
                  <TableRow>
                    <TableHead>الكتاب</TableHead>
                    <TableHead>النسخة</TableHead>
                    <TableHead>الطالب</TableHead>
                    <TableHead>تاريخ الإعارة</TableHead>
                    <TableHead>الاستحقاق</TableHead>
                    <TableHead>الإرجاع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التأخر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <Link
                          href={appRoutes.libraryLoanDetails(loan.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {loan.book_catalog?.title ?? "كتاب غير معروف"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground" dir="ltr">
                        {getCopyCode(loan)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.students?.full_name ?? "طالب غير معروف"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(loan.borrowed_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(loan.due_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(loan.returned_at)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={BOOK_LOAN_STATUS_TONES[loan.status]}>
                          {BOOK_LOAN_STATUS_LABELS_AR[loan.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={loan.is_overdue ? "warning" : "neutral"}>
                          {loan.is_overdue ? "متأخرة" : "في الموعد"}
                        </StatusBadge>
                      </TableCell>
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
