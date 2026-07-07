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
import { loadBookLoanDetail } from "@/lib/library/loans"
import {
  BOOK_LOAN_STATUS_LABELS_AR,
  BOOK_LOAN_STATUS_TONES,
} from "@/types/library"
import { ReturnBookLoanForm } from "../../_components/library-forms"

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

export default async function LibraryLoanDetailsPage({
  params,
}: {
  params: Promise<{ loanId: string }>
}) {
  const { loanId } = await params
  const contextResult = await requireLibraryContext(libraryReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الإعارة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإعارة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const loan = await loadBookLoanDetail(contextResult.data, loanId)

  if (!loan) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الإعارة" />
        <EmptyState
          icon={BookOpen}
          title="الإعارة غير موجودة"
          description="تعذر العثور على الإعارة داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const canReturn =
    canManageLibrary(contextResult.data.role) && loan.status === "active"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تفاصيل الإعارة"
        description={`${loan.book_catalog?.title ?? "كتاب غير معروف"} - ${
          loan.students?.full_name ?? "طالب غير معروف"
        }`}
        actions={
          <Link
            href={appRoutes.libraryLoans}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للإعارات
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الحالة</CardDescription>
            <CardTitle>
              <StatusBadge status={BOOK_LOAN_STATUS_TONES[loan.status]}>
                {BOOK_LOAN_STATUS_LABELS_AR[loan.status]}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الطالب</CardDescription>
            <CardTitle className="text-xl">
              {loan.students?.full_name ?? "غير معروف"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>تاريخ الإعارة</CardDescription>
            <CardTitle className="text-base">{formatDate(loan.borrowed_at)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>تاريخ الاستحقاق</CardDescription>
            <CardTitle className="text-base">{formatDate(loan.due_at)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>بيانات النسخة</CardTitle>
          <CardDescription>
            {loan.is_overdue ? "هذه الإعارة متأخرة حاليًا." : "بيانات النسخة المعارة."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الباركود</p>
            <p className="mt-1 text-sm leading-6" dir="ltr">
              {loan.book_copies?.barcode ?? "غير محدد"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">رقم القيد</p>
            <p className="mt-1 text-sm leading-6" dir="ltr">
              {loan.book_copies?.accession_number ?? "غير محدد"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الرف</p>
            <p className="mt-1 text-sm leading-6">
              {loan.book_copies?.shelf_location ?? "غير محدد"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-3">
            <p className="text-xs font-medium text-muted-foreground">ملاحظات</p>
            <p className="mt-1 text-sm leading-6">
              {loan.returned_at
                ? `أعيدت في ${formatDate(loan.returned_at)}`
                : loan.notes ?? "لا توجد ملاحظات."}
            </p>
          </div>
        </CardContent>
      </Card>

      {canReturn ? <ReturnBookLoanForm loanId={loan.id} /> : null}
    </div>
  )
}
