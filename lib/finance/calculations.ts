import "server-only"

import type { DiscountValueType, InvoiceStatus } from "@/types/finance"

type AmountLike = number | string | null | undefined

export type InvoiceLineAmount = {
  total_amount: AmountLike
}

export type PaymentAmount = {
  amount: AmountLike
  payment_status?: string | null
}

export type DiscountAmount = {
  value_type: DiscountValueType
  value: AmountLike
}

export function toMoneyNumber(value: AmountLike): number {
  const numberValue = Number(value ?? 0)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.round(numberValue * 100) / 100
}

export function calculateInvoiceSubtotal(items: InvoiceLineAmount[]): number {
  return toMoneyNumber(
    items.reduce((sum, item) => sum + toMoneyNumber(item.total_amount), 0)
  )
}

export function calculateInvoiceDiscounts(
  subtotalAmount: AmountLike,
  discounts: DiscountAmount[]
): number {
  const subtotal = toMoneyNumber(subtotalAmount)
  const discountTotal = discounts.reduce((sum, discount) => {
    const value = toMoneyNumber(discount.value)

    if (discount.value_type === "percentage") {
      return sum + subtotal * (value / 100)
    }

    return sum + value
  }, 0)

  return Math.min(toMoneyNumber(discountTotal), subtotal)
}

export function calculateInvoiceTotal(
  subtotalAmount: AmountLike,
  discountAmount: AmountLike
): number {
  return Math.max(
    toMoneyNumber(toMoneyNumber(subtotalAmount) - toMoneyNumber(discountAmount)),
    0
  )
}

export function calculateInvoicePaidAmount(payments: PaymentAmount[]): number {
  return toMoneyNumber(
    payments
      .filter((payment) => payment.payment_status === "completed")
      .reduce((sum, payment) => sum + toMoneyNumber(payment.amount), 0)
  )
}

export function calculateInvoiceBalance(
  totalAmount: AmountLike,
  paidAmount: AmountLike
): number {
  return Math.max(
    toMoneyNumber(toMoneyNumber(totalAmount) - toMoneyNumber(paidAmount)),
    0
  )
}

export function calculateInvoiceStatusAfterPayment(input: {
  currentStatus: InvoiceStatus
  totalAmount: AmountLike
  paidAmount: AmountLike
}): InvoiceStatus {
  if (input.currentStatus === "cancelled" || input.currentStatus === "void") {
    return input.currentStatus
  }

  const totalAmount = toMoneyNumber(input.totalAmount)
  const paidAmount = toMoneyNumber(input.paidAmount)

  if (paidAmount <= 0) {
    return input.currentStatus === "draft" ? "draft" : "issued"
  }

  if (paidAmount < totalAmount) {
    return "partially_paid"
  }

  return "paid"
}
