import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type {
  AcademicYear,
  ClassEnrollment,
  ClassSection,
  GradeLevel,
  GradeLevelStage,
  GradeLevelSubject,
  Subject,
  SubjectType,
  Term,
} from "@/types/academic"
import type { Student } from "@/types/students"
import type { AcademicModuleContext } from "@/lib/academic/context"

export type CreateAcademicYearInput = {
  name: string
  code: string
  starts_on: string
  ends_on: string
  is_current: boolean
}

export type CreateTermInput = {
  academic_year_id: string
  name: string
  code: string
  term_order: number
  starts_on: string
  ends_on: string
}

export type CreateGradeLevelInput = {
  name: string
  code: string
  grade_order: number
  stage: GradeLevelStage
}

export type CreateClassInput = {
  academic_year_id: string
  grade_level_id: string
  name: string
  section: string
  capacity: number | null
  room_name: string | null
}

export type CreateSubjectInput = {
  name: string
  code: string
  subject_type: SubjectType
  description: string | null
}

export type AssignSubjectToGradeLevelInput = {
  academic_year_id: string
  grade_level_id: string
  subject_id: string
  weekly_periods: number | null
  is_required: boolean
  sort_order: number
}

export type EnrollStudentInClassInput = {
  academic_year_id: string
  class_id: string
  student_id: string
  enrolled_on: string
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function assertAcademicYear(
  context: AcademicModuleContext,
  academicYearId: string
): Promise<AcademicYear> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("academic_years")
    .select("*")
    .eq("id", academicYearId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ACADEMIC_YEAR_NOT_FOUND")
  }

  return data
}

async function assertGradeLevel(
  context: AcademicModuleContext,
  gradeLevelId: string
): Promise<GradeLevel> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_levels")
    .select("*")
    .eq("id", gradeLevelId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("GRADE_LEVEL_NOT_FOUND")
  }

  return data
}

async function assertSubject(
  context: AcademicModuleContext,
  subjectId: string
): Promise<Subject> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("SUBJECT_NOT_FOUND")
  }

  return data
}

async function assertClassSection(
  context: AcademicModuleContext,
  classId: string
): Promise<ClassSection> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("CLASS_NOT_FOUND")
  }

  return data
}

async function assertStudent(
  context: AcademicModuleContext,
  studentId: string
): Promise<Student> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("STUDENT_NOT_FOUND")
  }

  return data
}

export async function listAcademicYears(
  context: AcademicModuleContext
): Promise<AcademicYear[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("academic_years")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("starts_on", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function createAcademicYear(
  context: AcademicModuleContext,
  input: CreateAcademicYearInput
): Promise<AcademicYear> {
  const supabase = await createSupabaseServerClient()
  const academicYearRecord: TablesInsert<"academic_years"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    name: input.name.trim(),
    code: input.code.trim(),
    starts_on: input.starts_on,
    ends_on: input.ends_on,
    is_current: input.is_current,
    status: input.is_current ? "active" : "draft",
  }

  const { data, error } = await supabase
    .from("academic_years")
    .insert(academicYearRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listTerms(
  context: AcademicModuleContext
): Promise<Term[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("terms")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("term_order", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function createTerm(
  context: AcademicModuleContext,
  input: CreateTermInput
): Promise<Term> {
  const supabase = await createSupabaseServerClient()
  const academicYear = await assertAcademicYear(context, input.academic_year_id)

  if (
    input.starts_on < academicYear.starts_on ||
    input.ends_on > academicYear.ends_on
  ) {
    throw new Error("TERM_OUTSIDE_ACADEMIC_YEAR")
  }

  const termRecord: TablesInsert<"terms"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    name: input.name.trim(),
    code: input.code.trim(),
    term_order: input.term_order,
    starts_on: input.starts_on,
    ends_on: input.ends_on,
  }

  const { data, error } = await supabase
    .from("terms")
    .insert(termRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listGradeLevels(
  context: AcademicModuleContext
): Promise<GradeLevel[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_levels")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("grade_order", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function createGradeLevel(
  context: AcademicModuleContext,
  input: CreateGradeLevelInput
): Promise<GradeLevel> {
  const supabase = await createSupabaseServerClient()
  const gradeLevelRecord: TablesInsert<"grade_levels"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    name: input.name.trim(),
    code: input.code.trim(),
    grade_order: input.grade_order,
    stage: input.stage,
  }

  const { data, error } = await supabase
    .from("grade_levels")
    .insert(gradeLevelRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listClasses(
  context: AcademicModuleContext
): Promise<ClassSection[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function createClass(
  context: AcademicModuleContext,
  input: CreateClassInput
): Promise<ClassSection> {
  const supabase = await createSupabaseServerClient()
  await assertAcademicYear(context, input.academic_year_id)
  await assertGradeLevel(context, input.grade_level_id)

  const classRecord: TablesInsert<"classes"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    grade_level_id: input.grade_level_id,
    name: input.name.trim(),
    section: input.section.trim(),
    capacity: input.capacity,
    room_name: trimToNull(input.room_name),
  }

  const { data, error } = await supabase
    .from("classes")
    .insert(classRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listSubjects(
  context: AcademicModuleContext
): Promise<Subject[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function createSubject(
  context: AcademicModuleContext,
  input: CreateSubjectInput
): Promise<Subject> {
  const supabase = await createSupabaseServerClient()
  const subjectRecord: TablesInsert<"subjects"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    name: input.name.trim(),
    code: input.code.trim(),
    description: trimToNull(input.description),
    subject_type: input.subject_type,
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert(subjectRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listGradeLevelSubjects(
  context: AcademicModuleContext
): Promise<GradeLevelSubject[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("grade_level_subjects")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("sort_order", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function assignSubjectToGradeLevel(
  context: AcademicModuleContext,
  input: AssignSubjectToGradeLevelInput
): Promise<GradeLevelSubject> {
  const supabase = await createSupabaseServerClient()
  await assertAcademicYear(context, input.academic_year_id)
  await assertGradeLevel(context, input.grade_level_id)
  await assertSubject(context, input.subject_id)

  const assignmentRecord: TablesInsert<"grade_level_subjects"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    grade_level_id: input.grade_level_id,
    subject_id: input.subject_id,
    is_required: input.is_required,
    weekly_periods: input.weekly_periods,
    sort_order: input.sort_order,
  }

  const { data, error } = await supabase
    .from("grade_level_subjects")
    .insert(assignmentRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listClassEnrollments(
  context: AcademicModuleContext
): Promise<ClassEnrollment[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data
}

export async function listEnrollableStudents(
  context: AcademicModuleContext
): Promise<Student[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .order("full_name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function enrollStudentInClass(
  context: AcademicModuleContext,
  input: EnrollStudentInClassInput
): Promise<ClassEnrollment> {
  const supabase = await createSupabaseServerClient()
  await assertAcademicYear(context, input.academic_year_id)
  await assertStudent(context, input.student_id)

  const classSection = await assertClassSection(context, input.class_id)

  if (classSection.academic_year_id !== input.academic_year_id) {
    throw new Error("CLASS_YEAR_MISMATCH")
  }

  await assertGradeLevel(context, classSection.grade_level_id)

  const { data: existingEnrollment, error: existingError } = await supabase
    .from("class_enrollments")
    .select("id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("student_id", input.student_id)
    .eq("status", "active")
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existingEnrollment) {
    throw new Error("ACTIVE_ENROLLMENT_EXISTS")
  }

  const enrollmentRecord: TablesInsert<"class_enrollments"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    class_id: input.class_id,
    student_id: input.student_id,
    grade_level_id: classSection.grade_level_id,
    enrolled_on: input.enrolled_on,
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("class_enrollments")
    .insert(enrollmentRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
