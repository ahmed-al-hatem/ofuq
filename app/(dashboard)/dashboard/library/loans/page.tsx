import Link from "next/link"
import { BookOpen, ShieldAlert } from "lucide-react"

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
import { requireLibraryContext } from "@/lib/library/context"
import { listBookLoans } from "@/lib/library/loans"
import {
  BOOK_LOAN_STATUS_LABELS_AR,
  BOOK_LOAN_STATUS_TONES,
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

  const loans = await listBookLoans(contextResult.data)
  const canManage = canManageLibrary(contextResult.data.role)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعارات"
        description="متابعة إعارات الطلاب النشطة والمسترجعة والمتأخرة."
        actions={
          canManage ? (
            <Link
              href={appRoutes.newLibraryLoan}
              className={buttonVariants({ size: "lg" })}
            >
              إعارة كتاب
            </Link>
          ) : null
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>سجل الإعارات</CardTitle>
          <CardDescription>
            يتم احتساب التأخر من تاريخ الاستحقاق للإعارات النشطة.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loans.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="لا توجد إعارات بعد"
              description="يمكن إنشاء إعارة بعد توفر نسخة كتاب وطالب نشط."
            />
          ) : (
            <table className="w-full min-w-[980px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الكتاب</th>
                  <th className="py-3 text-start font-medium">النسخة</th>
                  <th className="py-3 text-start font-medium">الطالب</th>
                  <th className="py-3 text-start font-medium">تاريخ الإعارة</th>
                  <th className="py-3 text-start font-medium">الاستحقاق</th>
                  <th className="py-3 text-start font-medium">الإرجاع</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">التأخر</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-border/60">
                    <td className="py-3">
                      <Link
                        href={appRoutes.libraryLoanDetails(loan.id)}
                        className="font-medium text-primary hover:underline"
                      >
                        {loan.book_catalog?.title ?? "كتاب غير معروف"}
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground" dir="ltr">
                      {getCopyCode(loan)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {loan.students?.full_name ?? "طالب غير معروف"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(loan.borrowed_at)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(loan.due_at)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(loan.returned_at)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={BOOK_LOAN_STATUS_TONES[loan.status]}>
                        {BOOK_LOAN_STATUS_LABELS_AR[loan.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      {loan.is_overdue ? (
                        <StatusBadge status="warning">متأخرة</StatusBadge>
                      ) : (
                        <StatusBadge>لا</StatusBadge>
                      )}
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
