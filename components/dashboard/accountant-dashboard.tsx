import { BadgePercent, CircleDollarSign, FileText, Receipt, Wallet } from "lucide-react"

import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { QuickActionCard } from "@/components/shared/quick-action-card"
import { SummarySectionCard } from "@/components/shared/summary-section-card"
import { formatCurrencyLabel } from "@/lib/dashboard/shared"
import { appRoutes } from "@/constants/routes"
import type { AccountantDashboardSummary } from "@/types/dashboard"

type AccountantDashboardProps = {
  summary: AccountantDashboardSummary
}

const quickActionIcons = [FileText, Receipt, BadgePercent, Wallet]

export function AccountantDashboard({ summary }: AccountantDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة المحاسب"
        description="نظرة مركزة على الفواتير والمدفوعات والرصيد القائم داخل المدرسة."
      />

      <KpiGrid
        items={[
          {
            title: "إجمالي الفواتير",
            value: summary.invoicesCount,
            description: "كل الفواتير المسجلة ضمن المدرسة الحالية.",
            icon: FileText,
            href: appRoutes.financeInvoices,
          },
          {
            title: "الفواتير المدفوعة",
            value: summary.paidInvoicesCount,
            description: "الفواتير التي اكتمل تحصيلها.",
            icon: CircleDollarSign,
            href: appRoutes.financeInvoices,
            tone: "success",
          },
          {
            title: "المدفوعات المسجلة",
            value: summary.paymentsCount,
            description: "عدد المدفوعات أو السندات المسجلة.",
            icon: Receipt,
            href: appRoutes.financePayments,
            tone: "info",
          },
          {
            title: "الرصيد القائم",
            value: formatCurrencyLabel(summary.outstandingBalance),
            description: "إجمالي المبالغ التي ما زالت قيد التحصيل.",
            icon: Wallet,
            href: appRoutes.reportsFinance,
            tone: "warning",
          },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {summary.quickActions.map((action, index) => {
          const Icon = quickActionIcons[index] ?? Wallet

          return <QuickActionCard key={action.title} {...action} icon={Icon} />
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SummarySectionCard
          title="آخر المدفوعات"
          description="الحركة المالية الحديثة داخل المدرسة."
          items={summary.recentPayments}
          emptyTitle="لا توجد مدفوعات مطابقة حاليًا"
          emptyDescription="انتقل إلى قسم المدفوعات لمراجعة السجلات المتاحة."
        />
        <SummarySectionCard
          title="ملخص التحصيل"
          description="نظرة سريعة على التوزيع المالي الحالي."
          items={[
            {
              id: "paid",
              title: "الفواتير المدفوعة",
              description: `${summary.paidInvoicesCount} فاتورة مكتملة التحصيل`,
              href: appRoutes.financeInvoices,
            },
            {
              id: "partial",
              title: "الفواتير الجزئية",
              description: `${summary.partialInvoicesCount} فاتورة تحتاج متابعة`,
              href: appRoutes.financeInvoices,
            },
            {
              id: "unpaid",
              title: "الفواتير غير المحصلة",
              description: `${summary.unpaidInvoicesCount} فاتورة بانتظار التحصيل`,
              href: appRoutes.financeInvoices,
            },
            {
              id: "discounts",
              title: "الخصومات النشطة",
              description: `${summary.activeDiscountsCount} حالة خصم نشطة`,
              href: appRoutes.financeDiscounts,
            },
          ]}
          emptyTitle="لا توجد بيانات مالية مطابقة حاليًا"
          emptyDescription="انتقل إلى المالية لمتابعة السجلات المتاحة."
        />
      </section>
    </div>
  )
}
