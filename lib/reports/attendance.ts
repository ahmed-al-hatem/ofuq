import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ReportsModuleContext } from "@/lib/reports/context"
import type { AttendanceSummaryReportRow } from "@/types/reports"

export type AttendanceReportFilters = {
  from?: string
  to?: string
}

export async function loadAttendanceSummaryReport(
  context: ReportsModuleContext,
  filters: AttendanceReportFilters = {}
): Promise<AttendanceSummaryReportRow[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("attendance_records")
    .select(
      "student_id, status, students(full_name), classes(name, section), attendance_sessions!inner(session_date)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (filters.from) {
    query = query.gte("attendance_sessions.session_date", filters.from)
  }

  if (filters.to) {
    query = query.lte("attendance_sessions.session_date", filters.to)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  const rows = new Map<string, AttendanceSummaryReportRow>()

  for (const record of data) {
    const student = Array.isArray(record.students)
      ? record.students[0]
      : record.students
    const classSection = Array.isArray(record.classes)
      ? record.classes[0]
      : record.classes
    const existing =
      rows.get(record.student_id) ??
      {
        student_id: record.student_id,
        student: student?.full_name ?? "طالب غير معروف",
        class_name: classSection?.name ?? null,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        excused_count: 0,
      }

    if (record.status === "present") {
      existing.present_count += 1
    } else if (record.status === "absent") {
      existing.absent_count += 1
    } else if (record.status === "late") {
      existing.late_count += 1
    } else if (record.status === "excused") {
      existing.excused_count += 1
    }

    rows.set(record.student_id, existing)
  }

  return Array.from(rows.values()).sort((a, b) =>
    a.student.localeCompare(b.student, "ar")
  )
}
