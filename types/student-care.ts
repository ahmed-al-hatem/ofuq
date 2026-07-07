import type { Enums, Tables } from "@/types/database"

export type HealthRecordStatus = Enums<"health_record_status">
export type VaccinationStatus = Enums<"vaccination_status">
export type ClinicVisitStatus = Enums<"clinic_visit_status">
export type DisciplineIncidentType = Enums<"discipline_incident_type">
export type DisciplineSeverity = Enums<"discipline_severity">
export type DisciplineStatus = Enums<"discipline_status">
export type AchievementCategory = Enums<"achievement_category">
export type AchievementLevel = Enums<"achievement_level">
export type AchievementStatus = Enums<"achievement_status">

export type HealthRecord = Tables<"health_records">
export type Vaccination = Tables<"vaccinations">
export type ClinicVisit = Tables<"clinic_visits">
export type DisciplineRecord = Tables<"discipline_records">
export type Achievement = Tables<"achievements">

export const HEALTH_RECORD_STATUS_LABELS_AR: Record<HealthRecordStatus, string> =
  {
    active: "نشط",
    archived: "مؤرشف",
  }

export const VACCINATION_STATUS_LABELS_AR: Record<VaccinationStatus, string> = {
  scheduled: "مجدول",
  completed: "مكتمل",
  missed: "فائت",
  exempted: "معفى",
  unknown: "غير معروف",
}

export const CLINIC_VISIT_STATUS_LABELS_AR: Record<ClinicVisitStatus, string> = {
  open: "مفتوحة",
  closed: "مغلقة",
  referred: "محالة",
  cancelled: "ملغاة",
}

export const DISCIPLINE_INCIDENT_TYPE_LABELS_AR: Record<
  DisciplineIncidentType,
  string
> = {
  behavior: "سلوك",
  attendance: "حضور",
  uniform: "زي مدرسي",
  bullying: "تنمر",
  damage: "إتلاف",
  academic_misconduct: "مخالفة أكاديمية",
  other: "أخرى",
}

export const DISCIPLINE_SEVERITY_LABELS_AR: Record<
  DisciplineSeverity,
  string
> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "مرتفعة",
  critical: "حرجة",
}

export const DISCIPLINE_STATUS_LABELS_AR: Record<DisciplineStatus, string> = {
  draft: "مسودة",
  submitted: "مرفوع",
  reviewed: "مراجع",
  resolved: "مغلق",
  cancelled: "ملغي",
}

export const ACHIEVEMENT_CATEGORY_LABELS_AR: Record<
  AchievementCategory,
  string
> = {
  academic: "أكاديمي",
  sports: "رياضي",
  arts: "فني",
  behavior: "سلوكي",
  attendance: "حضور",
  community: "مجتمعي",
  competition: "مسابقة",
  other: "أخرى",
}

export const ACHIEVEMENT_LEVEL_LABELS_AR: Record<AchievementLevel, string> = {
  class: "الصف",
  school: "المدرسة",
  district: "المنطقة",
  regional: "الإقليم",
  national: "وطني",
  international: "دولي",
}

export const ACHIEVEMENT_STATUS_LABELS_AR: Record<AchievementStatus, string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
}

export const HEALTH_RECORD_STATUS_TONES = {
  active: "success",
  archived: "neutral",
} as const

export const VACCINATION_STATUS_TONES = {
  scheduled: "warning",
  completed: "success",
  missed: "danger",
  exempted: "info",
  unknown: "neutral",
} as const

export const CLINIC_VISIT_STATUS_TONES = {
  open: "warning",
  closed: "success",
  referred: "info",
  cancelled: "neutral",
} as const

export const DISCIPLINE_SEVERITY_TONES = {
  low: "info",
  medium: "warning",
  high: "danger",
  critical: "danger",
} as const

export const DISCIPLINE_STATUS_TONES = {
  draft: "neutral",
  submitted: "warning",
  reviewed: "info",
  resolved: "success",
  cancelled: "neutral",
} as const

export const ACHIEVEMENT_STATUS_TONES = {
  draft: "neutral",
  published: "success",
  archived: "neutral",
} as const
