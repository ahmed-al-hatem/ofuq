import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type { Payment, PaymentMethod } from "@/types/finance"
import type { FinanceModuleContext } from "@/lib/finance/context"
import { toMoneyNumber } from "@/lib/finance/calculations"
import {
  loadInvoiceDetail,
  recalculateInvoiceTotals,
} from "@/lib/finance/invoices"
import { trimToNull } from "@/lib/finance/shared"

export type RecordManualPaymentInput = {
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  paid_at: string
  reference_number: string | null
  notes: string | null
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildReceiptNumber(): string {
  const datePart = todayDateString().replaceAll("-", "")
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase()
  return `REC-${datePart}-${randomPart}`
}

export async function listPayments(
  context: FinanceModuleContext,
  limit?: number
): Promise<Payment[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("paid_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function loadPaymentDetail(
  context: FinanceModuleContext,
  paymentId: string
): Promise<Payment | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data
}

export async function getCompletedPaymentTotal(
  context: FinanceModuleContext
): Promise<number> {
  const payments = await listPayments(context)

  return toMoneyNumber(
    payments
      .filter((payment) => payment.payment_status === "completed")
      .reduce((sum, payment) => sum + toMoneyNumber(payment.amount), 0)
  )
}

export async function recordManualPayment(
  context: FinanceModuleContext,
  input: RecordManualPaymentInput
): Promise<Payment> {
  const supabase = await createSupabaseServerClient()
  const detail = await loadInvoiceDetail(context, input.invoice_id)

  if (!detail) {
    throw new Error("INVOICE_NOT_FOUND")
  }

  if (
    detail.invoice.status === "cancelled" ||
    detail.invoice.status === "void"
  ) {
    throw new Error("INVOICE_TERMINAL")
  }

  const paymentAmount = toMoneyNumber(input.amount)
  const currentBalance = toMoneyNumber(detail.invoice.balance_amount)

  if (paymentAmount <= 0) {
    throw new Error("PAYMENT_AMOUNT_INVALID")
  }

  if (paymentAmount > currentBalance) {
    throw new Error("PAYMENT_OVERPAID")
  }

  const paymentRecord: TablesInsert<"payments"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    invoice_id: detail.invoice.id,
    student_id: detail.invoice.student_id,
    amount: paymentAmount,
    payment_method: input.payment_method,
    payment_status: "completed",
    paid_at: input.paid_at,
    reference_number: trimToNull(input.reference_number),
    receipt_number: buildReceiptNumber(),
    received_by_user_id: context.user_id,
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("payments")
    .insert(paymentRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await recalculateInvoiceTotals(context, detail.invoice.id)

  return data
}
