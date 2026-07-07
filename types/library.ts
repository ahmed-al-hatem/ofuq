import type { Enums, Tables } from "@/types/database"

export type BookCatalogStatus = Enums<"book_catalog_status">
export type BookCopyStatus = Enums<"book_copy_status">
export type BookCopyCondition = Enums<"book_copy_condition">
export type BookLoanStatus = Enums<"book_loan_status">

export type BookCatalog = Tables<"book_catalog">
export type BookCopy = Tables<"book_copies">
export type BookLoan = Tables<"book_loans">

export const BOOK_CATALOG_STATUS_LABELS_AR: Record<
  BookCatalogStatus,
  string
> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
}

export const BOOK_COPY_STATUS_LABELS_AR: Record<BookCopyStatus, string> = {
  available: "متاحة",
  loaned: "معارة",
  reserved: "محجوزة",
  lost: "مفقودة",
  damaged: "تالفة",
  archived: "مؤرشفة",
}

export const BOOK_COPY_CONDITION_LABELS_AR: Record<BookCopyCondition, string> = {
  new: "جديدة",
  good: "جيدة",
  fair: "متوسطة",
  poor: "ضعيفة",
  damaged: "تالفة",
}

export const BOOK_LOAN_STATUS_LABELS_AR: Record<BookLoanStatus, string> = {
  active: "نشطة",
  returned: "مسترجعة",
  overdue: "متأخرة",
  lost: "مفقودة",
  cancelled: "ملغاة",
}

export const BOOK_CATALOG_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const BOOK_COPY_STATUS_TONES = {
  available: "success",
  loaned: "info",
  reserved: "warning",
  lost: "danger",
  damaged: "warning",
  archived: "neutral",
} as const

export const BOOK_COPY_CONDITION_TONES = {
  new: "success",
  good: "success",
  fair: "info",
  poor: "warning",
  damaged: "danger",
} as const

export const BOOK_LOAN_STATUS_TONES = {
  active: "info",
  returned: "success",
  overdue: "warning",
  lost: "danger",
  cancelled: "neutral",
} as const
