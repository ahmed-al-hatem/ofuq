import type { Enums, Tables } from "@/types/database"

export type AdmissionStatus = Enums<"admission_status">
export type StudentStatus = Enums<"student_status">
export type StudentGender = Enums<"student_gender">
export type GuardianRelation = Enums<"guardian_relation">
export type StudentDocumentType = Enums<"student_document_type">

export type StudentAdmission = Tables<"student_admissions">
export type Student = Tables<"students">
export type StudentGuardian = Tables<"student_guardians">
export type StudentDocument = Tables<"student_documents">
export type StudentStatusHistory = Tables<"student_status_history">

export const ADMISSION_STATUS_LABELS_AR: Record<AdmissionStatus, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  cancelled: "ملغي",
}

export const STUDENT_STATUS_LABELS_AR: Record<StudentStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  transferred: "منقول",
  withdrawn: "منسحب",
  graduated: "متخرج",
  archived: "مؤرشف",
}

export const STUDENT_GENDER_LABELS_AR: Record<StudentGender, string> = {
  male: "ذكر",
  female: "أنثى",
}

export const GUARDIAN_RELATION_LABELS_AR: Record<GuardianRelation, string> = {
  father: "الأب",
  mother: "الأم",
  guardian: "ولي الأمر",
  other: "أخرى",
}

export const STUDENT_DOCUMENT_TYPE_LABELS_AR: Record<StudentDocumentType, string> = {
  birth_certificate: "شهادة ميلاد",
  national_id: "هوية وطنية",
  passport: "جواز سفر",
  medical_report: "تقرير طبي",
  previous_school_record: "سجل مدرسي سابق",
  photo: "صورة",
  other: "أخرى",
}

export const ADMISSION_STATUS_TONES = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral",
} as const

export const STUDENT_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  transferred: "info",
  withdrawn: "warning",
  graduated: "success",
  archived: "neutral",
} as const
