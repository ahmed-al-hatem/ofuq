import "server-only"

import type { GradesModuleContext } from "@/lib/grades/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type {
  GradeEntry,
  GradeEntryCategory,
  GradeEntryStatus,
} from "@/types/grades"

export type CreateGradeEntryInput = {
  academic_year_id: string
  term_id: string | null
  class_id: string
  subject_id: string
  student_id: string
  category: GradeEntryCategory
  title: string
  score: number
  max_score: number
  weight: number | null
  recorded_on: string
  notes: string | null
}

export type GradeEntryListItem = GradeEntry & {
  academic_years: { name: string } | null
  terms: { name: string } | null
  classes: { name: string; section: string } | null
  subjects: { name: string } | null
  students: { full_name: string; student_number: string } | null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function resolveValidatedEnrollment(
  context: GradesModuleContext,
  input: Pick<
    CreateGradeEntryInput,
    "academic_year_id" | "term_id" | "class_id" | "subject_id" | "student_id"
  >
): Promise<{ class_enrollment_id: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: academicYear, error: yearError } = await supabase
    .from("academic_years")
    .select("id")
    .eq("id", input.academic_year_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (yearError || !academicYear) {
    throw new Error("ACADEMIC_YEAR_NOT_FOUND")
  }

  const { data: classSection, error: classError } = await supabase
    .from("classes")
    .select("id, academic_year_id, grade_level_id")
    .eq("id", input.class_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (classError || !classSection) {
    throw new Error("CLASS_NOT_FOUND")
  }

  if (classSection.academic_year_id !== input.academic_year_id) {
    throw new Error("CLASS_YEAR_MISMATCH")
  }

  if (input.term_id) {
    const { data: term, error: termError } = await supabase
      .from("terms")
      .select("id, academic_year_id")
      .eq("id", input.term_id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .maybeSingle()

    if (termError || !term) {
      throw new Error("TERM_NOT_FOUND")
    }

    if (term.academic_year_id !== input.academic_year_id) {
      throw new Error("TERM_YEAR_MISMATCH")
    }
  }

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
    .eq("grade_level_id", classSection.grade_level_id)

  if (assignmentError) {
    throw new Error(assignmentError.message)
  }

  if (
    gradeAssignments.length > 0 &&
    !gradeAssignments.some((assignment) => assignment.subject_id === input.subject_id)
  ) {
    throw new Error("SUBJECT_NOT_ASSIGNED_TO_GRADE")
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, status")
    .eq("id", input.student_id)
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
    .eq("academic_year_id", input.academic_year_id)
    .eq("class_id", input.class_id)
    .eq("student_id", input.student_id)
    .eq("status", "active")
    .maybeSingle()

  if (enrollmentError || !enrollment) {
    throw new Error("ACTIVE_ENROLLMENT_NOT_FOUND")
  }

  return { class_enrollment_id: enrollment.id }
}

export async function listGradeEntries(
  context: GradesModuleContext,
  limit = 50
): Promise<GradeEntryListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_entries")
    .select(
      "*, academic_years(name), terms(name), classes(name, section), subjects(name), students(full_name, student_number)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("recorded_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as GradeEntryListItem[]
}

export async function createGradeEntry(
  context: GradesModuleContext,
  input: CreateGradeEntryInput
): Promise<GradeEntry> {
  if (input.score < 0 || input.max_score <= 0 || input.score > input.max_score) {
    throw new Error("SCORE_OUT_OF_RANGE")
  }

  const supabase = await createSupabaseServerClient()
  const enrollment = await resolveValidatedEnrollment(context, input)
  const gradeEntryRecord: TablesInsert<"grade_entries"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_id: input.class_id,
    subject_id: input.subject_id,
    student_id: input.student_id,
    class_enrollment_id: enrollment.class_enrollment_id,
    category: input.category,
    title: input.title.trim(),
    score: input.score,
    max_score: input.max_score,
    weight: input.weight,
    recorded_on: input.recorded_on,
    entered_by_user_id: context.user_id,
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("grade_entries")
    .insert(gradeEntryRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateGradeEntryStatus(
  context: GradesModuleContext,
  gradeEntryId: string,
  status: GradeEntryStatus
): Promise<GradeEntry> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_entries")
    .update({ status })
    .eq("id", gradeEntryId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
