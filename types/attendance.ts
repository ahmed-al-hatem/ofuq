import type { Enums, Tables } from "@/types/database"

export type AttendanceSessionMethod = Enums<"attendance_session_method">
export type AttendanceSessionStatus = Enums<"attendance_session_status">
export type AttendanceStatus = Enums<"attendance_status">
export type AttendanceRecordMethod = Enums<"attendance_record_method">
export type AbsenceExcuseStatus = Enums<"absence_excuse_status">

export type AttendanceSession = Tables<"attendance_sessions">
export type AttendanceRecord = Tables<"attendance_records">
export type AbsenceExcuse = Tables<"absence_excuses">

export const ATTENDANCE_SESSION_METHOD_LABELS_AR: Record<
  AttendanceSessionMethod,
  string
> = {
  manual: "يدوي",
  qr: "رمز QR",
}

export const ATTENDANCE_SESSION_STATUS_LABELS_AR: Record<
  AttendanceSessionStatus,
  string
> = {
  open: "مفتوحة",
  closed: "مغلقة",
  cancelled: "ملغاة",
}

export const ATTENDANCE_STATUS_LABELS_AR: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "غياب بعذر",
}

export const ATTENDANCE_RECORD_METHOD_LABELS_AR: Record<
  AttendanceRecordMethod,
  string
> = {
  manual: "يدوي",
  qr: "رمز QR",
  system: "النظام",
}

export const ABSENCE_EXCUSE_STATUS_LABELS_AR: Record<
  AbsenceExcuseStatus,
  string
> = {
  pending: "بانتظار المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  cancelled: "ملغي",
}

export const ATTENDANCE_SESSION_STATUS_TONES = {
  open: "success",
  closed: "neutral",
  cancelled: "warning",
} as const

export const ATTENDANCE_STATUS_TONES = {
  present: "success",
  absent: "danger",
  late: "warning",
  excused: "info",
} as const

export const ABSENCE_EXCUSE_STATUS_TONES = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral",
} as const
