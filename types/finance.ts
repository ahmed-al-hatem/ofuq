import type { Enums, Tables } from "@/types/database"

export type FeeStructureStatus = Enums<"fee_structure_status">
export type FeeItemType = Enums<"fee_item_type">
export type FeeItemStatus = Enums<"fee_item_status">
export type DiscountValueType = Enums<"discount_value_type">
export type DiscountStatus = Enums<"discount_status">
export type StudentDiscountStatus = Enums<"student_discount_status">
export type InvoiceStatus = Enums<"invoice_status">
export type PaymentMethod = Enums<"payment_method">
export type PaymentStatus = Enums<"payment_status">

export type FeeStructure = Tables<"fee_structures">
export type FeeItem = Tables<"fee_items">
export type DiscountType = Tables<"discount_types">
export type StudentDiscount = Tables<"student_discounts">
export type Invoice = Tables<"invoices">
export type InvoiceItem = Tables<"invoice_items">
export type Payment = Tables<"payments">

export const FEE_STRUCTURE_STATUS_LABELS_AR: Record<
  FeeStructureStatus,
  string
> = {
  active: "نشطة",
  inactive: "غير نشطة",
  archived: "مؤرشفة",
}

export const FEE_ITEM_TYPE_LABELS_AR: Record<FeeItemType, string> = {
  tuition: "رسوم دراسية",
  registration: "تسجيل",
  transport: "مواصلات",
  books: "كتب",
  uniform: "زي مدرسي",
  activity: "نشاط",
  exam: "اختبار",
  other: "أخرى",
}

export const FEE_ITEM_STATUS_LABELS_AR: Record<FeeItemStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
}

export const DISCOUNT_VALUE_TYPE_LABELS_AR: Record<
  DiscountValueType,
  string
> = {
  percentage: "نسبة مئوية",
  fixed_amount: "مبلغ ثابت",
}

export const DISCOUNT_STATUS_LABELS_AR: Record<DiscountStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
}

export const STUDENT_DISCOUNT_STATUS_LABELS_AR: Record<
  StudentDiscountStatus,
  string
> = {
  active: "نشط",
  inactive: "غير نشط",
  expired: "منتهي",
  cancelled: "ملغى",
}

export const INVOICE_STATUS_LABELS_AR: Record<InvoiceStatus, string> = {
  draft: "مسودة",
  issued: "صادرة",
  partially_paid: "مدفوعة جزئيًا",
  paid: "مدفوعة",
  cancelled: "ملغاة",
  void: "باطلة",
}

export const PAYMENT_METHOD_LABELS_AR: Record<PaymentMethod, string> = {
  cash: "نقدًا",
  bank_transfer: "تحويل بنكي",
  card: "بطاقة",
  cheque: "شيك",
  online: "إلكتروني",
  other: "أخرى",
}

export const PAYMENT_STATUS_LABELS_AR: Record<PaymentStatus, string> = {
  pending: "قيد الانتظار",
  completed: "مكتملة",
  cancelled: "ملغاة",
  failed: "فاشلة",
  refunded: "مستردة",
}

export const FEE_STRUCTURE_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const FEE_ITEM_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const DISCOUNT_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const STUDENT_DISCOUNT_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  expired: "warning",
  cancelled: "neutral",
} as const

export const INVOICE_STATUS_TONES = {
  draft: "neutral",
  issued: "info",
  partially_paid: "warning",
  paid: "success",
  cancelled: "neutral",
  void: "danger",
} as const

export const PAYMENT_STATUS_TONES = {
  pending: "warning",
  completed: "success",
  cancelled: "neutral",
  failed: "danger",
  refunded: "info",
} as const
