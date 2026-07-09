import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { buildAccountantDashboardSummary } from "@/lib/dashboard/builders"
import {
  createListItem,
  formatCurrencyLabel,
  formatDateTimeLabel,
  takeSingle,
} from "@/lib/dashboard/shared"
import { appRoutes } from "@/constants/routes"
import type { DashboardScope } from "@/types/dashboard"

export async function getAccountantDashboardSummary(scope: DashboardScope) {
  const supabase = await createSupabaseServerClient()
  const [invoicesResult, paymentsCountResult, discountsCountResult, paymentsResult] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("id, status, balance_amount")
        .eq("tenant_id", scope.tenant_id)
        .eq("school_id", scope.school_id),
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", scope.tenant_id)
        .eq("school_id", scope.school_id),
      supabase
        .from("student_discounts")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", scope.tenant_id)
        .eq("school_id", scope.school_id)
        .eq("status", "active"),
      supabase
        .from("payments")
        .select("id, amount, paid_at, receipt_number, students(full_name), invoices(invoice_number)")
        .eq("tenant_id", scope.tenant_id)
        .eq("school_id", scope.school_id)
        .order("paid_at", { ascending: false })
        .limit(4),
    ])

  const invoices = invoicesResult.data ?? []
  const outstandingBalance = invoices
    .filter((invoice) => invoice.status !== "cancelled" && invoice.status !== "void")
    .reduce((sum, invoice) => sum + Number(invoice.balance_amount), 0)

  return buildAccountantDashboardSummary({
    invoicesCount: invoices.length,
    paidInvoicesCount: invoices.filter((invoice) => invoice.status === "paid").length,
    partialInvoicesCount: invoices.filter(
      (invoice) => invoice.status === "partially_paid"
    ).length,
    unpaidInvoicesCount: invoices.filter((invoice) =>
      ["draft", "issued"].includes(invoice.status)
    ).length,
    paymentsCount: paymentsCountResult.count ?? 0,
    activeDiscountsCount: discountsCountResult.count ?? 0,
    outstandingBalance,
    recentPayments:
      paymentsResult.data?.map((payment) => {
        const student = takeSingle(payment.students)
        const invoice = takeSingle(payment.invoices)
        const amount = Number(payment.amount)

        return createListItem({
          id: payment.id,
          title: student?.full_name ?? payment.receipt_number,
          description: `${formatCurrencyLabel(amount)} · ${formatDateTimeLabel(payment.paid_at)}`,
          meta: invoice?.invoice_number ?? payment.receipt_number,
          href: appRoutes.financePaymentDetails(payment.id),
        })
      }) ?? [],
  })
}
