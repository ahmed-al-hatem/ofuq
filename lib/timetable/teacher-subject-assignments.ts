import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TimetableModuleContext } from "@/lib/timetable/context"
import type { ClassSection, GradeLevel, Subject } from "@/types/academic"
import type { TablesInsert } from "@/types/database"
import type { TeacherSubjectAssignment } from "@/types/timetable"

export type TeacherOption = {
  id: string
  full_name: string
  display_name: string | null
}

export type CreateTeacherSubjectAssignmentInput = {
  academic_year_id: string
  teacher_user_id: string
  subject_id: string
  grade_level_id: string | null
  class_id: string | null
}

async function assertAcademicYear(
  context: TimetableModuleContext,
  academicYearId: string
): Promise<void> {
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

async function assertSubject(
  context: TimetableModuleContext,
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

async function assertGradeLevel(
  context: TimetableModuleContext,
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

async function assertClassSection(
  context: TimetableModuleContext,
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

export async function assertActiveTeacherMembership(
  context: TimetableModuleContext,
  teacherUserId: string
): Promise<TeacherOption> {
  const supabase = await createSupabaseServerClient()
  const { data: membership, error: membershipError } = await supabase
    .from("user_memberships")
    .select("user_id")
    .eq("user_id", teacherUserId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("role", USER_ROLES.TEACHER)
    .eq("status", "active")
    .maybeSingle()

  if (membershipError || !membership) {
    throw new Error("TEACHER_NOT_FOUND")
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, full_name, display_name")
    .eq("id", teacherUserId)
    .maybeSingle()

  if (profileError || !profile) {
    throw new Error("TEACHER_NOT_FOUND")
  }

  return profile
}

export async function listTeacherOptions(
  context: TimetableModuleContext
): Promise<TeacherOption[]> {
  const supabase = await createSupabaseServerClient()
  const { data: memberships, error } = await supabase
    .from("user_memberships")
    .select("user_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("role", USER_ROLES.TEACHER)
    .eq("status", "active")
    .order("created_at", { ascending: true })

  if (error || !memberships?.length) {
    return []
  }

  const userIds = [...new Set(memberships.map((membership) => membership.user_id))]
  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, full_name, display_name")
    .in("id", userIds)
    .order("full_name", { ascending: true })

  if (profileError || !profiles) {
    return []
  }

  return profiles
}

export async function listTeacherSubjectAssignments(
  context: TimetableModuleContext
): Promise<TeacherSubjectAssignment[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("teacher_subject_assignments")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (context.role === USER_ROLES.TEACHER) {
    query = query.eq("teacher_user_id", context.user_id)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function countTeacherSubjectAssignments(
  context: TimetableModuleContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("teacher_subject_assignments")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")

  if (context.role === USER_ROLES.TEACHER) {
    query = query.eq("teacher_user_id", context.user_id)
  }

  const { count, error } = await query

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function createTeacherSubjectAssignment(
  context: TimetableModuleContext,
  input: CreateTeacherSubjectAssignmentInput
): Promise<TeacherSubjectAssignment> {
  const supabase = await createSupabaseServerClient()

  if (!input.grade_level_id && !input.class_id) {
    throw new Error("TEACHER_ASSIGNMENT_SCOPE_REQUIRED")
  }

  await assertAcademicYear(context, input.academic_year_id)
  await assertSubject(context, input.subject_id)
  await assertActiveTeacherMembership(context, input.teacher_user_id)

  let gradeLevelId = input.grade_level_id

  if (input.class_id) {
    const classSection = await assertClassSection(context, input.class_id)

    if (classSection.academic_year_id !== input.academic_year_id) {
      throw new Error("CLASS_YEAR_MISMATCH")
    }

    if (gradeLevelId && gradeLevelId !== classSection.grade_level_id) {
      throw new Error("CLASS_GRADE_LEVEL_MISMATCH")
    }

    gradeLevelId = classSection.grade_level_id
  }

  if (gradeLevelId) {
    await assertGradeLevel(context, gradeLevelId)
  }

  const assignmentRecord: TablesInsert<"teacher_subject_assignments"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    teacher_user_id: input.teacher_user_id,
    subject_id: input.subject_id,
    grade_level_id: gradeLevelId,
    class_id: input.class_id,
    created_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("teacher_subject_assignments")
    .insert(assignmentRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function assertActiveTeacherSubjectAssignment(input: {
  context: TimetableModuleContext
  academic_year_id: string
  class_id: string
  grade_level_id: string
  subject_id: string
  teacher_user_id: string
}): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("teacher_subject_assignments")
    .select("id, class_id, grade_level_id")
    .eq("tenant_id", input.context.tenant_id)
    .eq("school_id", input.context.school_id)
    .eq("academic_year_id", input.academic_year_id)
    .eq("teacher_user_id", input.teacher_user_id)
    .eq("subject_id", input.subject_id)
    .eq("status", "active")

  if (error) {
    throw new Error(error.message)
  }

  const matchingAssignment = data?.find(
    (assignment) => assignment.class_id === input.class_id
  )

  if (matchingAssignment) {
    return
  }

  const gradeLevelMatch = data?.some((assignment) => {
    return (
      !assignment.class_id && assignment.grade_level_id === input.grade_level_id
    )
  })

  if (!gradeLevelMatch) {
    throw new Error("TEACHER_ASSIGNMENT_NOT_FOUND")
  }
}
