import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AcademicYear, ClassEnrollment, ClassSection, GradeLevel, Term } from "@/types/academic"
import type { Student } from "@/types/students"
import type { FinanceModuleContext } from "@/lib/finance/context"

export function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

export async function assertAcademicYear(
  context: FinanceModuleContext,
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

export async function assertTerm(
  context: FinanceModuleContext,
  termId: string,
  academicYearId: string
): Promise<Term> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("terms")
    .select("*")
    .eq("id", termId)
    .eq("academic_year_id", academicYearId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("TERM_NOT_FOUND")
  }

  return data
}

export async function assertGradeLevel(
  context: FinanceModuleContext,
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

export async function assertClassSection(
  context: FinanceModuleContext,
  classId: string,
  academicYearId?: string
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

  if (academicYearId && data.academic_year_id !== academicYearId) {
    throw new Error("CLASS_YEAR_MISMATCH")
  }

  return data
}

export async function assertActiveStudent(
  context: FinanceModuleContext,
  studentId: string
): Promise<Student> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    throw new Error("STUDENT_NOT_FOUND")
  }

  return data
}

export async function resolveActiveClassEnrollment(
  context: FinanceModuleContext,
  studentId: string,
  academicYearId: string
): Promise<ClassEnrollment | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("student_id", studentId)
    .eq("academic_year_id", academicYearId)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listActiveStudents(
  context: FinanceModuleContext
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
