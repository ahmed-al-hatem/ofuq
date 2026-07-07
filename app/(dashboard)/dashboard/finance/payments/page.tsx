import Link from "next/link"
import { Receipt, ShieldAlert } from "lucide-react"

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
import { requireFinanceContext } from "@/lib/finance/context"
import { listInvoices } from "@/lib/finance/invoices"
import { listPayments } from "@/lib/finance/payments"
import { listActiveStudents } from "@/lib/finance/shared"
import {
  PAYMENT_METHOD_LABELS_AR,
  PAYMENT_STATUS_LABELS_AR,
  PAYMENT_STATUS_TONES,
} from "@/types/finance"

const financeRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

function formatMoney(value: number) {
  return new Intl.NumberFormat("ar", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function FinancePaymentsPage() {
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الدفعات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الدفعات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [payments, invoices, students] = await Promise.all([
    listPayments(contextResult.data),
    listInvoices(contextResult.data),
    listActiveStudents(contextResult.data),
  ])
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]))
  const studentById = new Map(students.map((student) => [student.id, student]))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الدفعات"
        description="دفعات يدوية مرتبطة بفواتير داخل المدرسة الحالية."
        actions={
          <Link
            href={appRoutes.financeInvoices}
            className={buttonVariants({ variant: "outline" })}
          >
            عرض الفواتير
          </Link>
        }
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="لا توجد دفعات بعد"
          description="افتح فاتورة صادرة أو مسودة ذات رصيد لتسجيل دفعة يدوية."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {payments.map((payment) => (
            <Card key={payment.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{payment.receipt_number}</CardTitle>
                    <CardDescription>
                      {studentById.get(payment.student_id)?.full_name ??
                        "طالب غير معروف"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={PAYMENT_STATUS_TONES[payment.payment_status]}>
                    {PAYMENT_STATUS_LABELS_AR[payment.payment_status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الفاتورة
                    </p>
                    <p className="mt-1 text-sm">
                      {invoiceById.get(payment.invoice_id)?.invoice_number ??
                        "غير معروفة"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      المبلغ
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {formatMoney(Number(payment.amount))}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الطريقة
                    </p>
                    <p className="mt-1 text-sm">
                      {PAYMENT_METHOD_LABELS_AR[payment.payment_method]}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      التاريخ
                    </p>
                    <p className="mt-1 text-sm">{formatDate(payment.paid_at)}</p>
                  </div>
                </div>
                <Link
                  href={appRoutes.financePaymentDetails(payment.id)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  عرض الإيصال
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
