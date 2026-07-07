export type StudentRosterReportRow = {
  student_number: string
  student_name: string
  status: string
  grade_level: string | null
  class_name: string | null
  guardian: string | null
}

export type AttendanceSummaryReportRow = {
  student_id: string
  student: string
  class_name: string | null
  present_count: number
  absent_count: number
  late_count: number
  excused_count: number
}

export type GradesSummaryReportRow = {
  student_id: string
  student: string
  class_name: string | null
  subject: string | null
  exam_result_summary: string
  grade_entry_summary: string
  report_card_status: string | null
}

export type FinanceBalancesReportRow = {
  student: string
  invoice_number: string
  total_amount: number
  paid_amount: number
  balance_amount: number
  status: string
}

export type TimetableOverviewReportRow = {
  day: string
  class_name: string | null
  subject: string | null
  teacher: string | null
  room: string | null
  starts_at: string
  ends_at: string
}
