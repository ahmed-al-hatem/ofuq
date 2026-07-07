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
import { loadPaymentDetail } from "@/lib/finance/payments"
import { listActiveStudents } from "@/lib/finance/shared"
import { createSupabaseServerClient } from "@/lib/supabase/server"
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
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value))
}

async function getReceiverName(receiverId: string | null) {
  if (!receiverId) {
    return "غير محدد"
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("user_profiles")
    .select("full_name, display_name")
    .eq("id", receiverId)
    .maybeSingle()

  return data?.display_name ?? data?.full_name ?? "غير محدد"
}

export default async function FinancePaymentDetailsPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const { paymentId } = await params
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إيصال الدفع" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإيصال"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [payment, invoices, students] = await Promise.all([
    loadPaymentDetail(contextResult.data, paymentId),
    listInvoices(contextResult.data),
    listActiveStudents(contextResult.data),
  ])

  if (!payment) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إيصال الدفع" />
        <EmptyState
          icon={Receipt}
          title="الإيصال غير موجود"
          description="تعذر العثور على الدفعة داخل المدرسة الحالية."
        />
      </div>
    )
  }

  const invoice = invoices.find((item) => item.id === payment.invoice_id)
  const student = students.find((item) => item.id === payment.student_id)
  const receiverName = await getReceiverName(payment.received_by_user_id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`إيصال ${payment.receipt_number}`}
        description="عرض تفصيلي لدفعة يدوية. لا يوجد PDF في هذه المرحلة."
        actions={
          <Link
            href={appRoutes.financePayments}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للدفعات
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>{payment.receipt_number}</CardTitle>
              <CardDescription>
                {invoice?.invoice_number ?? "فاتورة غير معروفة"}
              </CardDescription>
            </div>
            <StatusBadge status={PAYMENT_STATUS_TONES[payment.payment_status]}>
              {PAYMENT_STATUS_LABELS_AR[payment.payment_status]}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الطالب</p>
            <p className="mt-1">{student?.full_name ?? "طالب غير معروف"}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">المبلغ</p>
            <p className="mt-1 font-medium">{formatMoney(Number(payment.amount))}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">طريقة الدفع</p>
            <p className="mt-1">{PAYMENT_METHOD_LABELS_AR[payment.payment_method]}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">تاريخ الدفع</p>
            <p className="mt-1">{formatDate(payment.paid_at)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">استلمها</p>
            <p className="mt-1">{receiverName}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">رقم المرجع</p>
            <p className="mt-1">{payment.reference_number ?? "غير محدد"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
