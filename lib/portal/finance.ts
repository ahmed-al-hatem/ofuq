import "server-only"

import { canUseParentFinancialView } from "@/lib/portal/access"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext } from "@/types/portal"
import type {
  DiscountValueType,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  StudentDiscountStatus,
} from "@/types/finance"

type MaybeArray<T> = T | T[] | null

export type PortalFinanceInvoiceItem = {
  id: string
  student_id: string
  student_name: string
  student_number: string
  invoice_number: string
  issue_date: string
  due_date: string | null
  total_amount: number
  paid_amount: number
  balance_amount: number
  status: InvoiceStatus
}

export type PortalFinancePaymentItem = {
  id: string
  invoice_id: string
  student_id: string
  student_name: string
  student_number: string
  amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  paid_at: string
  receipt_number: string
}

export type PortalFinanceInvoiceLineItem = {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_amount: number
  discount_amount: number
  total_amount: number
  sort_order: number
}

export type PortalFinanceDiscountItem = {
  id: string
  student_id: string
  student_name: string
  student_number: string
  status: StudentDiscountStatus
  starts_on: string | null
  ends_on: string | null
  notes: string | null
  discount_name: string
  discount_value_type: DiscountValueType
  discount_value: number
}

export type PortalFinanceSummary = {
  canViewDetails: boolean
  note: string | null
  invoices: PortalFinanceInvoiceItem[]
  invoiceItems: PortalFinanceInvoiceLineItem[]
  payments: PortalFinancePaymentItem[]
  discounts: PortalFinanceDiscountItem[]
}

function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function getPortalFinanceSummary(
  context: PortalContext
): Promise<PortalFinanceSummary> {
  if (!canUseParentFinancialView(context.role)) {
    return {
      canViewDetails: false,
      note: "تفاصيل الرسوم والمدفوعات متاحة لولي الأمر فقط في هذه المرحلة.",
      invoices: [],
      invoiceItems: [],
      payments: [],
      discounts: [],
    }
  }

  if (context.linked_student_ids.length === 0) {
    return {
      canViewDetails: true,
      note: null,
      invoices: [],
      invoiceItems: [],
      payments: [],
      discounts: [],
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, student_id, invoice_number, issue_date, due_date, total_amount, paid_amount, balance_amount, status, students(full_name, student_number)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .in("student_id", context.linked_student_ids)
    .order("issue_date", { ascending: false })

  const invoiceIds = invoices?.map((invoice) => invoice.id) ?? []
  const [{ data: invoiceItems }, { data: payments }, { data: discounts }] = await Promise.all([
    invoiceIds.length > 0
      ? supabase
          .from("invoice_items")
          .select(
            "id, invoice_id, description, quantity, unit_amount, discount_amount, total_amount, sort_order"
          )
          .eq("tenant_id", context.tenant_id)
          .eq("school_id", context.school_id)
          .in("invoice_id", invoiceIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("payments")
      .select(
        "id, invoice_id, student_id, amount, payment_method, payment_status, paid_at, receipt_number, students(full_name, student_number)"
      )
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .in("student_id", context.linked_student_ids)
      .order("paid_at", { ascending: false }),
    supabase
      .from("student_discounts")
      .select(
        "id, student_id, status, starts_on, ends_on, notes, students(full_name, student_number), discount_types(name, value_type, value)"
      )
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .in("student_id", context.linked_student_ids)
      .order("created_at", { ascending: false }),
  ])

  return {
    canViewDetails: true,
    note: null,
    invoices:
      invoices?.map((row) => {
        const student = takeSingle(row.students)

        return {
          id: row.id,
          student_id: row.student_id,
          student_name: student?.full_name ?? "طالب غير معروف",
          student_number: student?.student_number ?? "-",
          invoice_number: row.invoice_number,
          issue_date: row.issue_date,
          due_date: row.due_date,
          total_amount: Number(row.total_amount),
          paid_amount: Number(row.paid_amount),
          balance_amount: Number(row.balance_amount),
          status: row.status,
        }
      }) ?? [],
    invoiceItems:
      invoiceItems?.map((row) => ({
        id: row.id,
        invoice_id: row.invoice_id,
        description: row.description,
        quantity: Number(row.quantity),
        unit_amount: Number(row.unit_amount),
        discount_amount: Number(row.discount_amount),
        total_amount: Number(row.total_amount),
        sort_order: row.sort_order,
      })) ?? [],
    payments:
      payments?.map((row) => {
        const student = takeSingle(row.students)

        return {
          id: row.id,
          invoice_id: row.invoice_id,
          student_id: row.student_id,
          student_name: student?.full_name ?? "طالب غير معروف",
          student_number: student?.student_number ?? "-",
          amount: Number(row.amount),
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          paid_at: row.paid_at,
          receipt_number: row.receipt_number,
        }
      }) ?? [],
    discounts:
      discounts?.map((row) => {
        const student = takeSingle(row.students)
        const discountType = takeSingle(row.discount_types)

        return {
          id: row.id,
          student_id: row.student_id,
          student_name: student?.full_name ?? "طالب غير معروف",
          student_number: student?.student_number ?? "-",
          status: row.status,
          starts_on: row.starts_on,
          ends_on: row.ends_on,
          notes: row.notes,
          discount_name: discountType?.name ?? "خصم",
          discount_value_type: discountType?.value_type ?? "fixed_amount",
          discount_value: discountType?.value ? Number(discountType.value) : 0,
        }
      }) ?? [],
  }
}
