import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { PortalContext, PortalStudentRecord } from "@/types/portal"
import { USER_ROLES } from "@/constants/roles"

type EnrollmentRow = {
  student_id: string
  class_id: string
  grade_level_id: string
  academic_year_id: string
  classes: { name: string; section: string } | { name: string; section: string }[] | null
  grade_levels: { name: string } | { name: string }[] | null
  academic_years: { name: string } | { name: string }[] | null
}

type GuardianRow = {
  student_id: string
  id: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string | null
  relation: PortalStudentRecord["guardians"][number]["relation"]
  is_primary: boolean
}

function takeSingle<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function listPortalEnrollmentScope(context: PortalContext): Promise<
  Array<{
    student_id: string
    class_id: string
    grade_level_id: string
    academic_year_id: string
  }>
> {
  if (context.linked_student_ids.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("student_id, class_id, grade_level_id, academic_year_id")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .in("student_id", context.linked_student_ids)

  if (error || !data) {
    return []
  }

  return data
}

export async function listPortalStudents(
  context: PortalContext
): Promise<PortalStudentRecord[]> {
  if (context.linked_student_ids.length === 0) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const [{ data: students, error: studentsError }, { data: enrollments }, { data: guardians }] =
    await Promise.all([
      supabase
        .from("students")
        .select(
          "id, full_name, student_number, status, birth_date, gender, nationality, enrolled_at"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .in("id", context.linked_student_ids)
        .order("full_name", { ascending: true }),
      supabase
        .from("class_enrollments")
        .select(
          "student_id, class_id, grade_level_id, academic_year_id, classes(name, section), grade_levels(name), academic_years(name)"
        )
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .eq("status", "active")
        .in("student_id", context.linked_student_ids),
      context.role === USER_ROLES.PARENT
        ? supabase
            .from("student_guardians")
            .select(
              "student_id, id, guardian_name, guardian_phone, guardian_email, relation, is_primary"
            )
            .eq("tenant_id", context.tenant_id)
            .eq("school_id", context.school_id)
            .in("student_id", context.linked_student_ids)
        : Promise.resolve({ data: [], error: null }),
    ])

  if (studentsError || !students) {
    return []
  }

  const enrollmentMap = new Map<string, EnrollmentRow>()
  for (const enrollment of (enrollments ?? []) as EnrollmentRow[]) {
    if (!enrollmentMap.has(enrollment.student_id)) {
      enrollmentMap.set(enrollment.student_id, enrollment)
    }
  }

  const guardianMap = new Map<string, GuardianRow[]>()
  for (const guardian of (guardians ?? []) as GuardianRow[]) {
    const studentGuardians = guardianMap.get(guardian.student_id) ?? []
    studentGuardians.push(guardian)
    guardianMap.set(guardian.student_id, studentGuardians)
  }

  return students.map((student) => {
    const enrollment = enrollmentMap.get(student.id)
    const classInfo = takeSingle(enrollment?.classes ?? null)
    const gradeInfo = takeSingle(enrollment?.grade_levels ?? null)
    const academicYearInfo = takeSingle(enrollment?.academic_years ?? null)

    return {
      ...student,
      active_enrollment:
        enrollment && classInfo && gradeInfo && academicYearInfo
          ? {
              class_id: enrollment.class_id,
              class_name: classInfo.name,
              class_section: classInfo.section,
              grade_level_id: enrollment.grade_level_id,
              grade_level_name: gradeInfo.name,
              academic_year_id: enrollment.academic_year_id,
              academic_year_name: academicYearInfo.name,
            }
          : null,
      guardians: guardianMap.get(student.id) ?? [],
    }
  })
}

export async function getPortalStudentById(
  context: PortalContext,
  studentId: string
): Promise<PortalStudentRecord | null> {
  const students = await listPortalStudents(context)

  return students.find((student) => student.id === studentId) ?? null
}
