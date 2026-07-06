import type { Enums, Tables } from "@/types/database"

export type AcademicYearStatus = Enums<"academic_year_status">
export type TermStatus = Enums<"term_status">
export type GradeLevelStage = Enums<"grade_level_stage">
export type GradeLevelStatus = Enums<"grade_level_status">
export type ClassStatus = Enums<"class_status">
export type SubjectType = Enums<"subject_type">
export type SubjectStatus = Enums<"subject_status">
export type ClassEnrollmentStatus = Enums<"class_enrollment_status">

export type AcademicYear = Tables<"academic_years">
export type Term = Tables<"terms">
export type GradeLevel = Tables<"grade_levels">
export type ClassSection = Tables<"classes">
export type Subject = Tables<"subjects">
export type GradeLevelSubject = Tables<"grade_level_subjects">
export type ClassEnrollment = Tables<"class_enrollments">

export const ACADEMIC_YEAR_STATUS_LABELS_AR: Record<
  AcademicYearStatus,
  string
> = {
  draft: "مسودة",
  active: "نشطة",
  closed: "مغلقة",
  archived: "مؤرشفة",
}

export const TERM_STATUS_LABELS_AR: Record<TermStatus, string> = {
  draft: "مسودة",
  active: "نشط",
  closed: "مغلق",
  archived: "مؤرشف",
}

export const GRADE_LEVEL_STAGE_LABELS_AR: Record<GradeLevelStage, string> = {
  kindergarten: "رياض الأطفال",
  primary: "ابتدائي",
  middle: "متوسط",
  secondary: "ثانوي",
  other: "أخرى",
}

export const GRADE_LEVEL_STATUS_LABELS_AR: Record<GradeLevelStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
}

export const CLASS_STATUS_LABELS_AR: Record<ClassStatus, string> = {
  active: "نشطة",
  inactive: "غير نشطة",
  archived: "مؤرشفة",
}

export const SUBJECT_TYPE_LABELS_AR: Record<SubjectType, string> = {
  core: "أساسية",
  elective: "اختيارية",
  activity: "نشاط",
  other: "أخرى",
}

export const SUBJECT_STATUS_LABELS_AR: Record<SubjectStatus, string> = {
  active: "نشطة",
  inactive: "غير نشطة",
  archived: "مؤرشفة",
}

export const CLASS_ENROLLMENT_STATUS_LABELS_AR: Record<
  ClassEnrollmentStatus,
  string
> = {
  active: "نشط",
  transferred: "منقول",
  withdrawn: "منسحب",
  completed: "مكتمل",
  archived: "مؤرشف",
}

export const ACADEMIC_YEAR_STATUS_TONES = {
  draft: "neutral",
  active: "success",
  closed: "warning",
  archived: "neutral",
} as const

export const TERM_STATUS_TONES = {
  draft: "neutral",
  active: "success",
  closed: "warning",
  archived: "neutral",
} as const

export const GRADE_LEVEL_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const CLASS_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const SUBJECT_STATUS_TONES = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
} as const

export const CLASS_ENROLLMENT_STATUS_TONES = {
  active: "success",
  transferred: "info",
  withdrawn: "warning",
  completed: "success",
  archived: "neutral",
} as const
