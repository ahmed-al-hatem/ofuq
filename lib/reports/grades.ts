import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ReportsModuleContext } from "@/lib/reports/context"
import type { GradesSummaryReportRow } from "@/types/reports"
import {
  EXAM_RESULT_STATUS_LABELS_AR,
  GRADE_ENTRY_STATUS_LABELS_AR,
  REPORT_CARD_STATUS_LABELS_AR,
} from "@/types/grades"

export async function loadGradesSummaryReport(
  context: ReportsModuleContext
): Promise<GradesSummaryReportRow[]> {
  const supabase = await createSupabaseServerClient()
  const [{ data: examResults }, { data: gradeEntries }, { data: reportCards }] =
    await Promise.all([
      supabase
        .from("exam_results")
        .select(
          "student_id, score, status, students(full_name), exams(classes(name, section), subjects(name), max_score)"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("grade_entries")
        .select(
          "student_id, score, max_score, status, students(full_name), classes(name, section), subjects(name)"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("report_cards")
        .select("student_id, status")
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .order("created_at", { ascending: false }),
    ])

  const reportCardStatusByStudent = new Map(
    (reportCards ?? []).map((card) => [card.student_id, card.status])
  )
  const rows = new Map<string, GradesSummaryReportRow>()

  for (const result of examResults ?? []) {
    const student = Array.isArray(result.students)
      ? result.students[0]
      : result.students
    const exam = Array.isArray(result.exams) ? result.exams[0] : result.exams
    const classSection = Array.isArray(exam?.classes)
      ? exam?.classes[0]
      : exam?.classes
    const subject = Array.isArray(exam?.subjects)
      ? exam?.subjects[0]
      : exam?.subjects
    const key = `${result.student_id}:${subject?.name ?? "exam"}`

    rows.set(key, {
      student_id: result.student_id,
      student: student?.full_name ?? "طالب غير معروف",
      class_name: classSection?.name ?? null,
      subject: subject?.name ?? null,
      exam_result_summary: `${Number(result.score)} / ${Number(exam?.max_score ?? 0)} - ${EXAM_RESULT_STATUS_LABELS_AR[result.status]}`,
      grade_entry_summary: "لا توجد مدخلات درجات",
      report_card_status: reportCardStatusByStudent.get(result.student_id)
        ? REPORT_CARD_STATUS_LABELS_AR[
            reportCardStatusByStudent.get(result.student_id)!
          ]
        : null,
    })
  }

  for (const entry of gradeEntries ?? []) {
    const student = Array.isArray(entry.students)
      ? entry.students[0]
      : entry.students
    const classSection = Array.isArray(entry.classes)
      ? entry.classes[0]
      : entry.classes
    const subject = Array.isArray(entry.subjects)
      ? entry.subjects[0]
      : entry.subjects
    const key = `${entry.student_id}:${subject?.name ?? "entry"}`
    const existing = rows.get(key)

    rows.set(key, {
      student_id: entry.student_id,
      student: existing?.student ?? student?.full_name ?? "طالب غير معروف",
      class_name: existing?.class_name ?? classSection?.name ?? null,
      subject: existing?.subject ?? subject?.name ?? null,
      exam_result_summary: existing?.exam_result_summary ?? "لا توجد نتائج اختبارات",
      grade_entry_summary: `${Number(entry.score)} / ${Number(entry.max_score)} - ${GRADE_ENTRY_STATUS_LABELS_AR[entry.status]}`,
      report_card_status:
        existing?.report_card_status ??
        (reportCardStatusByStudent.get(entry.student_id)
          ? REPORT_CARD_STATUS_LABELS_AR[
              reportCardStatusByStudent.get(entry.student_id)!
            ]
          : null),
    })
  }

  return Array.from(rows.values()).sort((a, b) =>
    a.student.localeCompare(b.student, "ar")
  )
}
