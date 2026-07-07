import Link from "next/link"
import { FileText, ShieldAlert } from "lucide-react"

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
import { loadInvoiceDetail } from "@/lib/finance/invoices"
import { listActiveStudents } from "@/lib/finance/shared"
import {
  INVOICE_STATUS_LABELS_AR,
  INVOICE_STATUS_TONES,
  PAYMENT_METHOD_LABELS_AR,
  PAYMENT_STATUS_LABELS_AR,
  PAYMENT_STATUS_TONES,
} from "@/types/finance"
import {
  CancelInvoiceForm,
  IssueInvoiceForm,
  RecordPaymentForm,
} from "../../_components/finance-forms"

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

function defaultDateTimeLocal() {
  return new Date().toISOString().slice(0, 16)
}

export default async function FinanceInvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الفاتورة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الفاتورة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [detail, students] = await Promise.all([
    loadInvoiceDetail(contextResult.data, invoiceId),
    listActiveStudents(contextResult.data),
  ])

  if (!detail) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الفاتورة" />
        <EmptyState
          icon={FileText}
          title="الفاتورة غير موجودة"
          description="تعذر العثور على الفاتورة داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const student = students.find((item) => item.id === detail.invoice.student_id)
  const canRecordPayment =
    detail.invoice.balance_amount > 0 &&
    detail.invoice.status !== "cancelled" &&
    detail.invoice.status !== "void"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`فاتورة ${detail.invoice.invoice_number}`}
        description={student?.full_name ?? "طالب غير معروف"}
        actions={
          <Link
            href={appRoutes.financeInvoices}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للفواتير
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الحالة</CardDescription>
            <CardTitle>
              <StatusBadge status={INVOICE_STATUS_TONES[detail.invoice.status]}>
                {INVOICE_STATUS_LABELS_AR[detail.invoice.status]}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الإجمالي</CardDescription>
            <CardTitle>{formatMoney(Number(detail.invoice.total_amount))}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>المدفوع</CardDescription>
            <CardTitle>{formatMoney(Number(detail.invoice.paid_amount))}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardDescription>الرصيد</CardDescription>
            <CardTitle>{formatMoney(Number(detail.invoice.balance_amount))}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>بنود الفاتورة</CardTitle>
            <CardDescription>
              الخصم الإجمالي المطبق:{" "}
              {formatMoney(Number(detail.invoice.discount_amount))}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {detail.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.description}</p>
                  <p className="font-medium">
                    {formatMoney(Number(item.total_amount))}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  الكمية {Number(item.quantity)} ×{" "}
                  {formatMoney(Number(item.unit_amount))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>إجراءات الفاتورة</CardTitle>
            <CardDescription>
              الإصدار والإلغاء وتسجيل الدفعات تبقى عمليات يدوية في هذه المرحلة.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {detail.invoice.status === "draft" ? (
              <IssueInvoiceForm invoiceId={detail.invoice.id} />
            ) : null}
            {detail.invoice.status !== "cancelled" &&
            detail.invoice.status !== "void" &&
            detail.payments.length === 0 ? (
              <CancelInvoiceForm invoiceId={detail.invoice.id} />
            ) : null}
            {!canRecordPayment ? (
              <p className="text-sm text-muted-foreground">
                لا توجد دفعة متاحة لهذه الفاتورة حاليًا.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {canRecordPayment ? (
        <RecordPaymentForm
          invoiceId={detail.invoice.id}
          balanceAmount={Number(detail.invoice.balance_amount)}
          defaultPaidAt={defaultDateTimeLocal()}
        />
      ) : null}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الدفعات</CardTitle>
          <CardDescription>سجل الدفعات المرتبطة بهذه الفاتورة.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {detail.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد دفعات بعد.</p>
          ) : (
            detail.payments.map((payment) => (
              <Link
                key={payment.id}
                href={appRoutes.financePaymentDetails(payment.id)}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{payment.receipt_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {PAYMENT_METHOD_LABELS_AR[payment.payment_method]} -{" "}
                      {formatDate(payment.paid_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="font-medium">
                      {formatMoney(Number(payment.amount))}
                    </p>
                    <StatusBadge status={PAYMENT_STATUS_TONES[payment.payment_status]}>
                      {PAYMENT_STATUS_LABELS_AR[payment.payment_status]}
                    </StatusBadge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
