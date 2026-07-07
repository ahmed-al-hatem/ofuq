import type { Json, Enums, Tables } from "@/types/database"

export type ComplaintCategory = Enums<"complaint_category">
export type ComplaintPriority = Enums<"complaint_priority">
export type ComplaintStatus = Enums<"complaint_status">
export type ComplaintUpdateType = Enums<"complaint_update_type">
export type SurveyTargetType = Enums<"survey_target_type">
export type SurveyStatus = Enums<"survey_status">
export type SurveyQuestionType = Enums<"survey_question_type">

export type Complaint = Tables<"complaints">
export type ComplaintUpdate = Tables<"complaint_updates">
export type Survey = Tables<"surveys">
export type SurveyQuestion = Tables<"survey_questions">
export type SurveyResponse = Tables<"survey_responses">

export type SurveyRatingOptions = {
  min: number
  max: number
  step?: number
}

export type SurveyAnswerValue = string | string[] | number | boolean | null
export type SurveyResponseAnswers = Record<string, SurveyAnswerValue>

export const COMPLAINT_CATEGORY_LABELS_AR: Record<ComplaintCategory, string> = {
  academic: "أكاديمية",
  behavior: "سلوكية",
  finance: "مالية",
  transport: "نقل",
  facility: "مرافق",
  communication: "تواصل",
  staff: "موظفين",
  other: "أخرى",
}

export const COMPLAINT_PRIORITY_LABELS_AR: Record<ComplaintPriority, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "مرتفعة",
  urgent: "عاجلة",
}

export const COMPLAINT_STATUS_LABELS_AR: Record<ComplaintStatus, string> = {
  submitted: "مستلمة",
  in_review: "قيد المراجعة",
  resolved: "محلولة",
  rejected: "مرفوضة",
  cancelled: "ملغاة",
}

export const COMPLAINT_UPDATE_TYPE_LABELS_AR: Record<
  ComplaintUpdateType,
  string
> = {
  comment: "تعليق",
  status_change: "تغيير حالة",
  assignment: "تعيين",
  resolution: "حل",
  internal_note: "ملاحظة داخلية",
}

export const SURVEY_TARGET_TYPE_LABELS_AR: Record<SurveyTargetType, string> = {
  school: "كل المدرسة",
  role: "حسب الدور",
  grade_level: "صف دراسي",
  class: "شعبة",
}

export const SURVEY_STATUS_LABELS_AR: Record<SurveyStatus, string> = {
  draft: "مسودة",
  published: "منشور",
  closed: "مغلق",
  archived: "مؤرشف",
}

export const SURVEY_QUESTION_TYPE_LABELS_AR: Record<
  SurveyQuestionType,
  string
> = {
  short_text: "نص قصير",
  long_text: "نص طويل",
  single_choice: "اختيار واحد",
  multiple_choice: "اختيارات متعددة",
  rating: "تقييم",
  yes_no: "نعم أو لا",
}

export const COMPLAINT_PRIORITY_TONES = {
  low: "info",
  medium: "warning",
  high: "danger",
  urgent: "danger",
} as const

export const COMPLAINT_STATUS_TONES = {
  submitted: "warning",
  in_review: "info",
  resolved: "success",
  rejected: "danger",
  cancelled: "neutral",
} as const

export const SURVEY_STATUS_TONES = {
  draft: "neutral",
  published: "success",
  closed: "warning",
  archived: "neutral",
} as const

export function parseSurveyChoiceOptions(options: Json | null): string[] {
  if (!Array.isArray(options)) {
    return []
  }

  return options
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
}

export function parseSurveyRatingOptions(
  options: Json | null
): SurveyRatingOptions {
  if (!options || Array.isArray(options) || typeof options !== "object") {
    return { min: 1, max: 5, step: 1 }
  }

  const min = Number(options.min)
  const max = Number(options.max)
  const step = Number(options.step ?? 1)

  if (
    Number.isNaN(min) ||
    Number.isNaN(max) ||
    min >= max ||
    Number.isNaN(step) ||
    step <= 0
  ) {
    return { min: 1, max: 5, step: 1 }
  }

  return {
    min,
    max,
    step,
  }
}

export function isSurveyResponseAnswers(
  value: Json | null
): value is SurveyResponseAnswers {
  return Boolean(value) && !Array.isArray(value) && typeof value === "object"
}

export function formatSurveyAnswerValue(answer: SurveyAnswerValue): string {
  if (answer === null || answer === undefined || answer === "") {
    return "بدون إجابة"
  }

  if (Array.isArray(answer)) {
    return answer.length > 0 ? answer.join("، ") : "بدون إجابة"
  }

  if (typeof answer === "boolean") {
    return answer ? "نعم" : "لا"
  }

  return String(answer)
}
