import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext } from "@/types/portal"
import type {
  BasicReportCardSummary,
  ExamResultStatus,
  GradeEntryCategory,
  GradeEntryStatus,
  ReportCardStatus,
} from "@/types/grades"

type MaybeArray<T> = T | T[] | null

export type PortalExamResultItem = {
  id: string
  student_id: string
  student_name: string
  student_number: string
  status: ExamResultStatus
  score: number | null
  entered_at: string
  exam_title: string
  exam_date: string | null
  max_score: number
  subject_name: string
}

export type PortalGradeEntryItem = {
  id: string
  student_id: string
  student_name: string
  student_number: string
  title: string
  category: GradeEntryCategory
  status: GradeEntryStatus
  score: number
  max_score: number
  recorded_on: string
  subject_name: string
}

export type PortalReportCardItem = {
  id: string
  student_id: string
  student_name: string
  student_number: string
  status: ReportCardStatus
  generated_at: string
  published_at: string | null
  class_name: string | null
  class_section: string | null
  academic_year_name: string | null
  term_name: string | null
  teacher_remarks: string | null
  summary: BasicReportCardSummary
}

function takeSingle<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function listPortalGrades(
  context: PortalContext
): Promise<{
  examResults: PortalExamResultItem[]
  gradeEntries: PortalGradeEntryItem[]
  reportCards: PortalReportCardItem[]
}> {
  if (context.linked_student_ids.length === 0) {
    return {
      examResults: [],
      gradeEntries: [],
      reportCards: [],
    }
  }

  const supabase = await createSupabaseServerClient()
  const [{ data: examResults }, { data: gradeEntries }, { data: reportCards }] =
    await Promise.all([
      supabase
        .from("exam_results")
        .select(
          "id, student_id, status, score, entered_at, students(full_name, student_number), exams(title, exam_date, max_score), subjects(name)"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .in("student_id", context.linked_student_ids)
        .order("entered_at", { ascending: false }),
      supabase
        .from("grade_entries")
        .select(
          "id, student_id, title, category, status, score, max_score, recorded_on, students(full_name, student_number), subjects(name)"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .in("student_id", context.linked_student_ids)
        .order("recorded_on", { ascending: false }),
      supabase
        .from("report_cards")
        .select(
          "id, student_id, status, generated_at, published_at, teacher_remarks, summary, students(full_name, student_number), classes(name, section), academic_years(name), terms(name)"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .in("student_id", context.linked_student_ids)
        .order("generated_at", { ascending: false }),
    ])

  return {
    examResults:
      examResults?.map((row) => {
        const student = takeSingle(row.students)
        const exam = takeSingle(row.exams)
        const subject = takeSingle(row.subjects)

        return {
          id: row.id,
          student_id: row.student_id,
          student_name: student?.full_name ?? "طالب غير معروف",
          student_number: student?.student_number ?? "-",
          status: row.status,
          score: row.score === null ? null : Number(row.score),
          entered_at: row.entered_at,
          exam_title: exam?.title ?? "اختبار",
          exam_date: exam?.exam_date ?? null,
          max_score: exam?.max_score ? Number(exam.max_score) : 0,
          subject_name: subject?.name ?? "مادة غير معروفة",
        }
      }) ?? [],
    gradeEntries:
      gradeEntries?.map((row) => {
        const student = takeSingle(row.students)
        const subject = takeSingle(row.subjects)

        return {
          id: row.id,
          student_id: row.student_id,
          student_name: student?.full_name ?? "طالب غير معروف",
          student_number: student?.student_number ?? "-",
          title: row.title,
          category: row.category,
          status: row.status,
          score: Number(row.score),
          max_score: Number(row.max_score),
          recorded_on: row.recorded_on,
          subject_name: subject?.name ?? "مادة غير معروفة",
        }
      }) ?? [],
    reportCards:
      reportCards?.map((row) => {
        const student = takeSingle(row.students)
        const classInfo = takeSingle(row.classes)
        const academicYear = takeSingle(row.academic_years)
        const term = takeSingle(row.terms)

        return {
          id: row.id,
          student_id: row.student_id,
          student_name: student?.full_name ?? "طالب غير معروف",
          student_number: student?.student_number ?? "-",
          status: row.status,
          generated_at: row.generated_at,
          published_at: row.published_at,
          class_name: classInfo?.name ?? null,
          class_section: classInfo?.section ?? null,
          academic_year_name: academicYear?.name ?? null,
          term_name: term?.name ?? null,
          teacher_remarks: row.teacher_remarks,
          summary: row.summary as BasicReportCardSummary,
        }
      }) ?? [],
  }
}
