import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type { Invoice, InvoiceItem, Payment } from "@/types/finance"
import type { FinanceModuleContext } from "@/lib/finance/context"
import {
  calculateInvoiceBalance,
  calculateInvoiceDiscounts,
  calculateInvoicePaidAmount,
  calculateInvoiceStatusAfterPayment,
  calculateInvoiceSubtotal,
  calculateInvoiceTotal,
  toMoneyNumber,
} from "@/lib/finance/calculations"
import { listApplicableDiscountTypes } from "@/lib/finance/discounts"
import {
  assertFeeStructure,
  listActiveFeeItemsForStructure,
} from "@/lib/finance/fee-structures"
import {
  assertAcademicYear,
  assertActiveStudent,
  assertTerm,
  resolveActiveClassEnrollment,
  trimToNull,
} from "@/lib/finance/shared"

export type GenerateInvoiceInput = {
  student_id: string
  academic_year_id: string
  term_id: string | null
  fee_structure_id: string
  due_date: string | null
  notes: string | null
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildInvoiceNumber(): string {
  const datePart = todayDateString().replaceAll("-", "")
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase()
  return `INV-${datePart}-${randomPart}`
}

export async function listInvoices(
  context: FinanceModuleContext,
  limit?: number
): Promise<Invoice[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function listInvoiceItems(
  context: FinanceModuleContext,
  invoiceId: string
): Promise<InvoiceItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function countIssuedInvoices(
  context: FinanceModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("status", ["issued", "partially_paid", "paid"])

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function getFinanceOverviewTotals(
  context: FinanceModuleContext
): Promise<{
  issuedInvoicesTotal: number
  paidTotal: number
  outstandingBalance: number
}> {
  const invoices = await listInvoices(context)

  return {
    issuedInvoicesTotal: toMoneyNumber(
      invoices
        .filter((invoice) => invoice.status !== "draft")
        .reduce((sum, invoice) => sum + toMoneyNumber(invoice.total_amount), 0)
    ),
    paidTotal: toMoneyNumber(
      invoices.reduce((sum, invoice) => sum + toMoneyNumber(invoice.paid_amount), 0)
    ),
    outstandingBalance: toMoneyNumber(
      invoices
        .filter(
          (invoice) => invoice.status !== "cancelled" && invoice.status !== "void"
        )
        .reduce(
          (sum, invoice) => sum + toMoneyNumber(invoice.balance_amount),
          0
        )
    ),
  }
}

export async function loadInvoiceDetail(
  context: FinanceModuleContext,
  invoiceId: string
): Promise<{ invoice: Invoice; items: InvoiceItem[]; payments: Payment[] } | null> {
  const supabase = await createSupabaseServerClient()
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !invoice) {
    return null
  }

  const [items, paymentsResult] = await Promise.all([
    listInvoiceItems(context, invoice.id),
    supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .eq("invoice_id", invoice.id)
      .order("paid_at", { ascending: false }),
  ])

  return {
    invoice,
    items,
    payments: paymentsResult.data ?? [],
  }
}

export async function recalculateInvoiceTotals(
  context: FinanceModuleContext,
  invoiceId: string
): Promise<Invoice> {
  const supabase = await createSupabaseServerClient()
  const detail = await loadInvoiceDetail(context, invoiceId)

  if (!detail) {
    throw new Error("INVOICE_NOT_FOUND")
  }

  const subtotalAmount = calculateInvoiceSubtotal(detail.items)
  const paidAmount = calculateInvoicePaidAmount(detail.payments)
  const totalAmount = calculateInvoiceTotal(
    subtotalAmount,
    detail.invoice.discount_amount
  )
  const balanceAmount = calculateInvoiceBalance(totalAmount, paidAmount)
  const status = calculateInvoiceStatusAfterPayment({
    currentStatus: detail.invoice.status,
    totalAmount,
    paidAmount,
  })

  const { data, error } = await supabase
    .from("invoices")
    .update({
      subtotal_amount: subtotalAmount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      balance_amount: balanceAmount,
      status,
    })
    .eq("id", detail.invoice.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function generateInvoiceFromFeeStructure(
  context: FinanceModuleContext,
  input: GenerateInvoiceInput
): Promise<Invoice> {
  const supabase = await createSupabaseServerClient()
  await assertActiveStudent(context, input.student_id)
  await assertAcademicYear(context, input.academic_year_id)

  if (input.term_id) {
    await assertTerm(context, input.term_id, input.academic_year_id)
  }

  const feeStructure = await assertFeeStructure(context, input.fee_structure_id)

  if (feeStructure.status !== "active") {
    throw new Error("FEE_STRUCTURE_NOT_ACTIVE")
  }

  if (feeStructure.academic_year_id !== input.academic_year_id) {
    throw new Error("FEE_STRUCTURE_YEAR_MISMATCH")
  }

  const feeItems = await listActiveFeeItemsForStructure(
    context,
    feeStructure.id
  )

  if (feeItems.length === 0) {
    throw new Error("FEE_STRUCTURE_HAS_NO_ITEMS")
  }

  const issueDate = todayDateString()
  const subtotalAmount = calculateInvoiceSubtotal(
    feeItems.map((item) => ({ total_amount: item.amount }))
  )
  const discountTypes = await listApplicableDiscountTypes({
    context,
    student_id: input.student_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    issue_date: issueDate,
  })
  const discountAmount = calculateInvoiceDiscounts(subtotalAmount, discountTypes)
  const totalAmount = calculateInvoiceTotal(subtotalAmount, discountAmount)
  const classEnrollment = await resolveActiveClassEnrollment(
    context,
    input.student_id,
    input.academic_year_id
  )

  const invoiceRecord: TablesInsert<"invoices"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    invoice_number: buildInvoiceNumber(),
    student_id: input.student_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_enrollment_id: classEnrollment?.id ?? null,
    issue_date: issueDate,
    due_date: input.due_date,
    subtotal_amount: subtotalAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    paid_amount: 0,
    balance_amount: totalAmount,
    status: "draft",
    notes: trimToNull(input.notes),
    created_by_user_id: context.user_id,
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert(invoiceRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const invoiceItemRecords: TablesInsert<"invoice_items">[] = feeItems.map(
    (item, index) => ({
      tenant_id: context.tenant_id,
      school_id: context.school_id,
      invoice_id: invoice.id,
      fee_item_id: item.id,
      description: item.name,
      quantity: 1,
      unit_amount: item.amount,
      discount_amount: 0,
      total_amount: item.amount,
      sort_order: index + 1,
    })
  )

  const { error: itemError } = await supabase
    .from("invoice_items")
    .insert(invoiceItemRecords)

  if (itemError) {
    throw new Error(itemError.message)
  }

  return recalculateInvoiceTotals(context, invoice.id)
}

export async function issueInvoice(
  context: FinanceModuleContext,
  invoiceId: string
): Promise<Invoice> {
  const supabase = await createSupabaseServerClient()
  const detail = await loadInvoiceDetail(context, invoiceId)

  if (!detail) {
    throw new Error("INVOICE_NOT_FOUND")
  }

  if (detail.invoice.status !== "draft") {
    throw new Error("INVOICE_CANNOT_BE_ISSUED")
  }

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "issued",
      issued_by_user_id: context.user_id,
      issued_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function cancelInvoice(
  context: FinanceModuleContext,
  invoiceId: string
): Promise<Invoice> {
  const supabase = await createSupabaseServerClient()
  const detail = await loadInvoiceDetail(context, invoiceId)

  if (!detail) {
    throw new Error("INVOICE_NOT_FOUND")
  }

  const completedPayments = detail.payments.filter(
    (payment) => payment.payment_status === "completed"
  )

  if (completedPayments.length > 0) {
    throw new Error("INVOICE_HAS_PAYMENTS")
  }

  if (detail.invoice.status === "paid" || detail.invoice.status === "void") {
    throw new Error("INVOICE_CANNOT_BE_CANCELLED")
  }

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "cancelled",
      balance_amount: 0,
    })
    .eq("id", invoiceId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
