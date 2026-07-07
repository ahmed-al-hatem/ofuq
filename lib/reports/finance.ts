import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ReportsModuleContext } from "@/lib/reports/context"
import type { FinanceBalancesReportRow } from "@/types/reports"
import { INVOICE_STATUS_LABELS_AR } from "@/types/finance"

export async function loadFinanceBalancesReport(
  context: ReportsModuleContext
): Promise<FinanceBalancesReportRow[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "invoice_number, total_amount, paid_amount, balance_amount, status, students(full_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("issue_date", { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((invoice) => {
    const student = Array.isArray(invoice.students)
      ? invoice.students[0]
      : invoice.students

    return {
      student: student?.full_name ?? "طالب غير معروف",
      invoice_number: invoice.invoice_number,
      total_amount: Number(invoice.total_amount),
      paid_amount: Number(invoice.paid_amount),
      balance_amount: Number(invoice.balance_amount),
      status: INVOICE_STATUS_LABELS_AR[invoice.status],
    }
  })
}
