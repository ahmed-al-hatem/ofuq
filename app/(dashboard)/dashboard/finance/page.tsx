import Link from "next/link"
import {
  Banknote,
  FileText,
  Percent,
  Receipt,
  ShieldAlert,
  WalletCards,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
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
import { countActiveStudentDiscounts } from "@/lib/finance/discounts"
import { requireFinanceContext } from "@/lib/finance/context"
import { countActiveFeeStructures } from "@/lib/finance/fee-structures"
import {
  countIssuedInvoices,
  getFinanceOverviewTotals,
  listInvoices,
} from "@/lib/finance/invoices"
import { listPayments } from "@/lib/finance/payments"

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
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(
    new Date(value)
  )
}

export default async function FinanceOverviewPage() {
  const contextResult = await requireFinanceContext(financeRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="المالية"
          description="إدارة الرسوم والفواتير والدفعات اليدوية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الوحدة المالية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [
    overviewTotals,
    issuedInvoicesCount,
    activeFeeStructuresCount,
    activeStudentDiscountsCount,
    recentInvoices,
    recentPayments,
  ] = await Promise.all([
    getFinanceOverviewTotals(contextResult.data),
    countIssuedInvoices(contextResult.data),
    countActiveFeeStructures(contextResult.data),
    countActiveStudentDiscounts(contextResult.data),
    listInvoices(contextResult.data, 4),
    listPayments(contextResult.data, 4),
  ])

  const overviewCards = [
    {
      title: "إجمالي الفواتير الصادرة",
      value: formatMoney(overviewTotals.issuedInvoicesTotal),
      description: `${issuedInvoicesCount} فاتورة صادرة أو مدفوعة`,
      href: appRoutes.financeInvoices,
      icon: FileText,
    },
    {
      title: "إجمالي المدفوع",
      value: formatMoney(overviewTotals.paidTotal),
      description: "دفعات مكتملة ومسجلة يدويًا",
      href: appRoutes.financePayments,
      icon: Banknote,
    },
    {
      title: "الرصيد المستحق",
      value: formatMoney(overviewTotals.outstandingBalance),
      description: "الرصيد المتبقي على الفواتير غير الملغاة",
      href: appRoutes.financeInvoices,
      icon: WalletCards,
    },
    {
      title: "خطط الرسوم النشطة",
      value: activeFeeStructuresCount,
      description: "خطط يمكن توليد فواتير منها",
      href: appRoutes.financeFees,
      icon: Receipt,
    },
    {
      title: "خصومات الطلاب النشطة",
      value: activeStudentDiscountsCount,
      description: "خصومات تطبق عند توليد الفواتير",
      href: appRoutes.financeDiscounts,
      icon: Percent,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المالية"
        description="أساس مالي عملي للرسوم والخصومات والفواتير والدفعات، مع احتساب الإجماليات على الخادم."
        actions={
          <Link
            href={appRoutes.newFinanceInvoice}
            className={buttonVariants({ size: "lg" })}
          >
            توليد فاتورة
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-2xl">{card.value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح الصفحة
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>أحدث الفواتير</CardTitle>
            <CardDescription>آخر الفواتير التي تم توليدها.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد فواتير بعد.</p>
            ) : (
              recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={appRoutes.financeInvoiceDetails(invoice.id)}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMoney(Number(invoice.total_amount))} - الرصيد{" "}
                    {formatMoney(Number(invoice.balance_amount))}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>أحدث الدفعات</CardTitle>
            <CardDescription>دفعات يدوية مكتملة أو مسجلة مؤخرًا.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد دفعات بعد.</p>
            ) : (
              recentPayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={appRoutes.financePaymentDetails(payment.id)}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="font-medium">{payment.receipt_number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMoney(Number(payment.amount))} -{" "}
                    {formatDate(payment.paid_at)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
