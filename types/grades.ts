import type { Enums, Tables } from "@/types/database"

export type ExamStatus = Enums<"exam_status">
export type ExamResultStatus = Enums<"exam_result_status">
export type GradeEntryCategory = Enums<"grade_entry_category">
export type GradeEntryStatus = Enums<"grade_entry_status">
export type ReportCardStatus = Enums<"report_card_status">

export type Exam = Tables<"exams">
export type ExamResult = Tables<"exam_results">
export type GradeEntry = Tables<"grade_entries">
export type ReportCard = Tables<"report_cards">

export type ReportCardSubjectSummary = {
  subject_id: string
  subject_name: string
  total_score: number
  max_score: number
  percentage: number | null
}

export type BasicReportCardSummary = {
  subjects: ReportCardSubjectSummary[]
  overall?: {
    total_score: number
    max_score: number
    percentage: number | null
  }
}

export const EXAM_STATUS_LABELS_AR: Record<ExamStatus, string> = {
  draft: "مسودة",
  scheduled: "مجدول",
  completed: "مكتمل",
  published: "منشور",
  cancelled: "ملغي",
}

export const EXAM_RESULT_STATUS_LABELS_AR: Record<ExamResultStatus, string> = {
  draft: "مسودة",
  entered: "مدخل",
  published: "منشور",
  absent: "غائب",
  excused: "معذور",
}

export const GRADE_ENTRY_CATEGORY_LABELS_AR: Record<GradeEntryCategory, string> =
  {
    quiz: "اختبار قصير",
    assignment: "تكليف",
    homework: "واجب",
    project: "مشروع",
    participation: "مشاركة",
    behavior: "سلوك",
    other: "أخرى",
  }

export const GRADE_ENTRY_STATUS_LABELS_AR: Record<GradeEntryStatus, string> = {
  draft: "مسودة",
  entered: "مدخلة",
  published: "منشورة",
}

export const REPORT_CARD_STATUS_LABELS_AR: Record<ReportCardStatus, string> = {
  draft: "مسودة",
  published: "منشورة",
  archived: "مؤرشفة",
}

export const EXAM_STATUS_TONES = {
  draft: "neutral",
  scheduled: "info",
  completed: "success",
  published: "success",
  cancelled: "warning",
} as const

export const EXAM_RESULT_STATUS_TONES = {
  draft: "neutral",
  entered: "info",
  published: "success",
  absent: "warning",
  excused: "info",
} as const

export const GRADE_ENTRY_STATUS_TONES = {
  draft: "neutral",
  entered: "info",
  published: "success",
} as const

export const REPORT_CARD_STATUS_TONES = {
  draft: "neutral",
  published: "success",
  archived: "neutral",
} as const
