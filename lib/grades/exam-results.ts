import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { getExamById, updateExamStatus, type ExamDetails } from "@/lib/grades/exams"
import type { GradesModuleContext } from "@/lib/grades/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type { ExamResult, ExamResultStatus } from "@/types/grades"

export type ExamResultListItem = ExamResult & {
  students: { full_name: string; student_number: string } | null
  user_profiles: { full_name: string } | null
}

export type SaveExamResultInput = {
  exam_id: string
  student_id: string
  score: number | null
  status: ExamResultStatus
  notes: string | null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function resolveActiveEnrollmentForExam(
  context: GradesModuleContext,
  exam: ExamDetails,
  studentId: string
): Promise<{ class_enrollment_id: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, status")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (studentError || !student) {
    throw new Error("STUDENT_NOT_FOUND")
  }

  if (student.status !== "active") {
    throw new Error("STUDENT_NOT_ACTIVE")
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("class_enrollments")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", exam.academic_year_id)
    .eq("class_id", exam.class_id)
    .eq("student_id", studentId)
    .eq("status", "active")
    .maybeSingle()

  if (enrollmentError || !enrollment) {
    throw new Error("ACTIVE_ENROLLMENT_NOT_FOUND")
  }

  return { class_enrollment_id: enrollment.id }
}

function validateExamScore(
  exam: ExamDetails,
  input: Pick<SaveExamResultInput, "score" | "status">
) {
  if (input.status === "absent" || input.status === "excused") {
    if (input.score !== null) {
      throw new Error("ABSENCE_SCORE_MUST_BE_EMPTY")
    }

    return
  }

  if (input.score === null) {
    throw new Error("SCORE_REQUIRED")
  }

  if (input.score < 0 || input.score > Number(exam.max_score)) {
    throw new Error("SCORE_OUT_OF_RANGE")
  }
}

export async function listExamResultsForExam(
  context: GradesModuleContext,
  examId: string
): Promise<ExamResultListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("exam_results")
    .select("*, students(full_name, student_number), user_profiles(full_name)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("exam_id", examId)
    .order("entered_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as ExamResultListItem[]
}

export async function saveExamResult(
  context: GradesModuleContext,
  input: SaveExamResultInput
): Promise<ExamResult> {
  const supabase = await createSupabaseServerClient()
  const exam = await getExamById(context, input.exam_id)
  const enrollment = await resolveActiveEnrollmentForExam(
    context,
    exam,
    input.student_id
  )

  validateExamScore(exam, input)

  const resultRecord: TablesInsert<"exam_results"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    exam_id: exam.id,
    academic_year_id: exam.academic_year_id,
    term_id: exam.term_id,
    class_id: exam.class_id,
    subject_id: exam.subject_id,
    student_id: input.student_id,
    class_enrollment_id: enrollment.class_enrollment_id,
    score: input.score,
    status: input.status,
    entered_by_user_id: context.user_id,
    entered_at: new Date().toISOString(),
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("exam_results")
    .upsert(resultRecord, { onConflict: "exam_id,student_id" })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function publishExamResults(
  context: GradesModuleContext,
  examId: string
): Promise<number> {
  if (
    context.role !== USER_ROLES.SYSTEM_ADMIN &&
    context.role !== USER_ROLES.SCHOOL_ADMIN
  ) {
    throw new Error("PUBLISH_NOT_ALLOWED")
  }

  const supabase = await createSupabaseServerClient()
  const exam = await getExamById(context, examId)
  const publishedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from("exam_results")
    .update({ status: "published", published_at: publishedAt })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("exam_id", exam.id)
    .in("status", ["entered", "draft"])
    .not("score", "is", null)
    .select("id")

  if (error) {
    throw new Error(error.message)
  }

  await updateExamStatus(context, exam.id, "published")

  return data?.length ?? 0
}
