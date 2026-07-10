import { CircleDollarSign, ShieldAlert } from "lucide-react"

import { PortalReadOnlyNotice } from "@/components/portal/portal-read-only-notice"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requirePortalContext } from "@/lib/portal/context"
import { getPortalFinanceSummary } from "@/lib/portal/finance"
import {
  DISCOUNT_VALUE_TYPE_LABELS_AR,
  INVOICE_STATUS_LABELS_AR,
  INVOICE_STATUS_TONES,
  PAYMENT_METHOD_LABELS_AR,
  PAYMENT_STATUS_LABELS_AR,
  PAYMENT_STATUS_TONES,
  STUDENT_DISCOUNT_STATUS_LABELS_AR,
  STUDENT_DISCOUNT_STATUS_TONES,
} from "@/types/finance"

function formatDate(value: string | null) {
  if (!value) {
    return "غير متوفر"
  }

  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ar-SY", {
    style: "currency",
    currency: "SYP",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function PortalFinancePage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="المالية" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى البيانات المالية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const finance = await getPortalFinanceSummary(contextResult.data)
  const outstandingBalance = finance.invoices.reduce(
    (sum, invoice) => sum + invoice.balance_amount,
    0
  )
  const totalPaidAmount = finance.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )
  const activeDiscountsCount = finance.discounts.filter(
    (discount) => discount.status === "active"
  ).length

  return (
    <PageShell>
      <PageHeader
        title="المالية"
        description="عرض قراءة فقط للفواتير والمدفوعات والخصومات ضمن النطاق المسموح."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      {!finance.canViewDetails ? (
        <EmptyState
          icon={CircleDollarSign}
          title="عرض مالي محدود"
          description={finance.note ?? "لا تتوفر بيانات مالية لهذا الدور."}
        />
      ) : (
        <>
          <PortalReadOnlyNotice
            title="ملخص مالي للمتابعة"
            description="تُعرض هنا الفواتير والمدفوعات كما اعتمدتها المدرسة. لا تتضمن هذه الصفحة أي دفع إلكتروني أو تسجيل دفعة جديدة."
            notes={[
              "يمكنك استخدام هذه الصفحة لمراجعة الرصيد الحالي وسجلات السداد السابقة فقط.",
              "إذا ظهر نقص أو اختلاف في أي مبلغ، تتم مراجعته من خلال الإدارة المالية في المدرسة.",
            ]}
          />

          <KpiGrid
            items={[
              {
                title: "عدد الفواتير",
                value: finance.invoices.length,
                description: "إجمالي الفواتير المرتبطة بالطلاب الظاهرين لك.",
                icon: CircleDollarSign,
                tone: "info",
              },
              {
                title: "الرصيد المتبقي",
                value: formatMoney(outstandingBalance),
                description: "المبلغ القائم غير المسدد حتى الآن.",
                icon: CircleDollarSign,
                tone: outstandingBalance > 0 ? "warning" : "success",
              },
              {
                title: "إجمالي المدفوع",
                value: formatMoney(totalPaidAmount),
                description: "مجموع المبالغ المسجلة كمدفوعات ضمن هذا النطاق.",
                icon: CircleDollarSign,
                tone: "success",
              },
              {
                title: "الخصومات النشطة",
                value: activeDiscountsCount,
                description: "عدد الخصومات الفعالة حاليًا ضمن السجلات المعروضة.",
                icon: CircleDollarSign,
                tone: "default",
              },
            ]}
          />

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>الفواتير</CardTitle>
              <CardDescription>
                لا تتوفر من هذه الصفحة أي وسيلة لدفع إلكتروني أو تسجيل دفعة جديدة.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {finance.invoices.length === 0 ? (
                <EmptyState
                  title="لا توجد فواتير"
                  description="لم تُنشأ فواتير ضمن نطاق الطلاب المسموح بعرضهم."
                />
              ) : (
                finance.invoices.map((invoice) => {
                  const items = finance.invoiceItems.filter(
                    (item) => item.invoice_id === invoice.id
                  )

                  return (
                    <div
                      key={invoice.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.student_name} - {invoice.student_number}
                          </p>
                        </div>
                        <StatusBadge status={INVOICE_STATUS_TONES[invoice.status]}>
                          {INVOICE_STATUS_LABELS_AR[invoice.status]}
                        </StatusBadge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/60 bg-background p-4">
                          <p className="text-xs font-medium text-muted-foreground">
                            الإجمالي
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {formatMoney(invoice.total_amount)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background p-4">
                          <p className="text-xs font-medium text-muted-foreground">
                            المدفوع
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {formatMoney(invoice.paid_amount)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background p-4">
                          <p className="text-xs font-medium text-muted-foreground">
                            المتبقي
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {formatMoney(invoice.balance_amount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>تاريخ الإصدار: {formatDate(invoice.issue_date)}</span>
                        <span>الاستحقاق: {formatDate(invoice.due_date)}</span>
                      </div>

                      {items.length > 0 ? (
                        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-4">
                          <p className="text-xs font-medium text-muted-foreground">
                            بنود الفاتورة
                          </p>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-3 text-sm"
                            >
                              <span>{item.description}</span>
                              <span>{formatMoney(item.total_amount)}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>المدفوعات</CardTitle>
                <CardDescription>المدفوعات المسجلة فقط دون أي إجراء إضافي.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {finance.payments.length === 0 ? (
                  <EmptyState
                    title="لا توجد مدفوعات"
                    description="لم تُسجل مدفوعات ضمن هذا النطاق بعد."
                  />
                ) : (
                  finance.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{payment.receipt_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.student_name} -{" "}
                            {PAYMENT_METHOD_LABELS_AR[payment.payment_method]}
                          </p>
                        </div>
                        <StatusBadge status={PAYMENT_STATUS_TONES[payment.payment_status]}>
                          {PAYMENT_STATUS_LABELS_AR[payment.payment_status]}
                        </StatusBadge>
                      </div>
                      <p className="mt-3 text-sm leading-6">
                        {formatMoney(payment.amount)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDateTime(payment.paid_at)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>الخصومات</CardTitle>
                <CardDescription>
                  تعرض الخصومات المرتبطة بالطلاب ضمن هذا الحساب.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {finance.discounts.length === 0 ? (
                  <EmptyState
                    title="لا توجد خصومات"
                    description="لم تُسجل خصومات ضمن هذا النطاق بعد."
                  />
                ) : (
                  finance.discounts.map((discount) => (
                    <div
                      key={discount.id}
                      className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{discount.discount_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {discount.student_name} - {discount.student_number}
                          </p>
                        </div>
                        <StatusBadge status={STUDENT_DISCOUNT_STATUS_TONES[discount.status]}>
                          {STUDENT_DISCOUNT_STATUS_LABELS_AR[discount.status]}
                        </StatusBadge>
                      </div>
                      <p className="mt-3 text-sm leading-6">
                        {DISCOUNT_VALUE_TYPE_LABELS_AR[discount.discount_value_type]} -{" "}
                        {formatMoney(discount.discount_value)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        من {formatDate(discount.starts_on)} إلى{" "}
                        {formatDate(discount.ends_on)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </PageShell>
  )
}
