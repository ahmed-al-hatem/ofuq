import { CircleDollarSign, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import {
  requireReportsContext,
  writeReportAuditLog,
} from "@/lib/reports/context"
import { loadFinanceBalancesReport } from "@/lib/reports/finance"

const reportRoles = [
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

export default async function FinanceBalancesReportPage() {
  const contextResult = await requireReportsContext(reportRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تقرير المالية" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تقرير المالية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const rows = await loadFinanceBalancesReport(contextResult.data)
  await writeReportAuditLog(contextResult.data, "finance_balances")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تقرير المالية"
        description="أرصدة الفواتير الحالية: الإجمالي، المدفوع، والمتبقي."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>أرصدة الفواتير</CardTitle>
          <CardDescription>{rows.length} فاتورة في النطاق الحالي.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              icon={CircleDollarSign}
              title="لا توجد بيانات"
              description="لا توجد فواتير مطابقة داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[780px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-2 text-start">الطالب</th>
                  <th className="px-3 py-2 text-start">رقم الفاتورة</th>
                  <th className="px-3 py-2 text-start">الإجمالي</th>
                  <th className="px-3 py-2 text-start">المدفوع</th>
                  <th className="px-3 py-2 text-start">الرصيد</th>
                  <th className="px-3 py-2 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.invoice_number} className="border-b last:border-b-0">
                    <td className="px-3 py-3 font-medium">{row.student}</td>
                    <td className="px-3 py-3">{row.invoice_number}</td>
                    <td className="px-3 py-3">{formatMoney(row.total_amount)}</td>
                    <td className="px-3 py-3">{formatMoney(row.paid_amount)}</td>
                    <td className="px-3 py-3">{formatMoney(row.balance_amount)}</td>
                    <td className="px-3 py-3">{row.status}</td>
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
