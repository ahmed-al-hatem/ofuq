import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { GradesModuleContext } from "@/lib/grades/context"
import type { TablesInsert } from "@/types/database"
import type { Exam, ExamStatus } from "@/types/grades"

export type CreateExamInput = {
  academic_year_id: string
  term_id: string | null
  class_id: string
  subject_id: string
  title: string
  exam_date: string | null
  max_score: number
  weight: number | null
  notes: string | null
}

export type ExamListItem = Exam & {
  academic_years: { name: string } | null
  terms: { name: string } | null
  classes: { name: string; section: string } | null
  subjects: { name: string } | null
  user_profiles: { full_name: string } | null
  exam_results: { count: number }[]
}

export type ExamDetails = Exam & {
  academic_years: { name: string } | null
  terms: { name: string } | null
  classes: { name: string; section: string } | null
  grade_levels: { name: string } | null
  subjects: { name: string } | null
  user_profiles: { full_name: string } | null
}

export type EnrolledExamStudent = {
  id: string
  student_id: string
  class_id: string
  academic_year_id: string
  student: {
    id: string
    full_name: string
    student_number: string
    status: string
  } | null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function assertAcademicYear(
  context: GradesModuleContext,
  academicYearId: string
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("academic_years")
    .select("id")
    .eq("id", academicYearId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ACADEMIC_YEAR_NOT_FOUND")
  }
}

async function assertClassForYear(
  context: GradesModuleContext,
  classId: string,
  academicYearId: string
): Promise<{ id: string; academic_year_id: string; grade_level_id: string }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("id, academic_year_id, grade_level_id")
    .eq("id", classId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("CLASS_NOT_FOUND")
  }

  if (data.academic_year_id !== academicYearId) {
    throw new Error("CLASS_YEAR_MISMATCH")
  }

  return data
}

async function assertTermForYear(
  context: GradesModuleContext,
  termId: string,
  academicYearId: string
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("terms")
    .select("id, academic_year_id")
    .eq("id", termId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("TERM_NOT_FOUND")
  }

  if (data.academic_year_id !== academicYearId) {
    throw new Error("TERM_YEAR_MISMATCH")
  }
}

async function assertSubjectForGradeYear(
  context: GradesModuleContext,
  input: {
    academic_year_id: string
    grade_level_id: string
    subject_id: string
  }
) {
  const supabase = await createSupabaseServerClient()
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", input.subject_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (subjectError || !subject) {
    throw new Error("SUBJECT_NOT_FOUND")
  }

  const { data: gradeAssignments, error: assignmentError } = await supabase
    .from("grade_level_subjects")
    .select("subject_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("grade_level_id", input.grade_level_id)

  if (assignmentError) {
    throw new Error(assignmentError.message)
  }

  if (
    gradeAssignments.length > 0 &&
    !gradeAssignments.some((assignment) => assignment.subject_id === input.subject_id)
  ) {
    throw new Error("SUBJECT_NOT_ASSIGNED_TO_GRADE")
  }
}

export async function countExams(
  context: GradesModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("exams")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function listExams(
  context: GradesModuleContext,
  limit = 50
): Promise<ExamListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("exams")
    .select(
      "*, academic_years(name), terms(name), classes(name, section), subjects(name), user_profiles(full_name), exam_results(count)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as ExamListItem[]
}

export async function getExamById(
  context: GradesModuleContext,
  examId: string
): Promise<ExamDetails> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("exams")
    .select(
      "*, academic_years(name), terms(name), classes(name, section), grade_levels(name), subjects(name), user_profiles(full_name)"
    )
    .eq("id", examId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("EXAM_NOT_FOUND")
  }

  return data as unknown as ExamDetails
}

export async function createExam(
  context: GradesModuleContext,
  input: CreateExamInput
): Promise<Exam> {
  const supabase = await createSupabaseServerClient()
  await assertAcademicYear(context, input.academic_year_id)
  const classSection = await assertClassForYear(
    context,
    input.class_id,
    input.academic_year_id
  )

  if (input.term_id) {
    await assertTermForYear(context, input.term_id, input.academic_year_id)
  }

  await assertSubjectForGradeYear(context, {
    academic_year_id: input.academic_year_id,
    grade_level_id: classSection.grade_level_id,
    subject_id: input.subject_id,
  })

  const examRecord: TablesInsert<"exams"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_id: input.class_id,
    grade_level_id: classSection.grade_level_id,
    subject_id: input.subject_id,
    title: input.title.trim(),
    exam_date: input.exam_date,
    max_score: input.max_score,
    weight: input.weight,
    created_by_user_id: context.user_id,
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("exams")
    .insert(examRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateExamStatus(
  context: GradesModuleContext,
  examId: string,
  status: ExamStatus
): Promise<Exam> {
  const supabase = await createSupabaseServerClient()
  await getExamById(context, examId)

  const { data, error } = await supabase
    .from("exams")
    .update({ status })
    .eq("id", examId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function loadExamStudents(
  context: GradesModuleContext,
  examId: string
): Promise<EnrolledExamStudent[]> {
  const exam = await getExamById(context, examId)
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("id, student_id, academic_year_id, class_id, students(id, full_name, student_number, status)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", exam.academic_year_id)
    .eq("class_id", exam.class_id)
    .eq("status", "active")
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((enrollment) => ({
    id: enrollment.id,
    student_id: enrollment.student_id,
    academic_year_id: enrollment.academic_year_id,
    class_id: enrollment.class_id,
    student: Array.isArray(enrollment.students)
      ? enrollment.students[0] ?? null
      : enrollment.students ?? null,
  })) as EnrolledExamStudent[]
}
