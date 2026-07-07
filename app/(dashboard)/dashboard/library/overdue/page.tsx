import Link from "next/link"
import { ClockAlert, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
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

const libraryReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.LIBRARIAN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function LibraryOverduePage() {
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الإعارات المتأخرة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإعارات المتأخرة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const loans = (await listBookLoans(contextResult.data)).filter(
    (loan) => loan.is_overdue
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعارات المتأخرة"
        description="قائمة بالإعارات النشطة التي تجاوزت تاريخ الاستحقاق."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>المتأخرات</CardTitle>
          <CardDescription>
            لا توجد غرامات أو ربط مالي في هذه المرحلة.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loans.length === 0 ? (
            <EmptyState
              icon={ClockAlert}
              title="لا توجد إعارات متأخرة"
              description="كل الإعارات النشطة الحالية ضمن تاريخ الاستحقاق."
            />
          ) : (
            loans.map((loan) => (
              <Link
                key={loan.id}
                href={appRoutes.libraryLoanDetails(loan.id)}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {loan.book_catalog?.title ?? "كتاب غير معروف"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {loan.students?.full_name ?? "طالب غير معروف"} - الاستحقاق{" "}
                      {formatDate(loan.due_at)}
                    </p>
                  </div>
                  <StatusBadge status="warning">متأخرة</StatusBadge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
