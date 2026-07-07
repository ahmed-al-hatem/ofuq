import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ReportsModuleContext } from "@/lib/reports/context"
import type { StudentRosterReportRow } from "@/types/reports"
import { STUDENT_STATUS_LABELS_AR } from "@/types/students"

export async function loadStudentRosterReport(
  context: ReportsModuleContext
): Promise<StudentRosterReportRow[]> {
  const supabase = await createSupabaseServerClient()
  const [{ data: students }, { data: enrollments }, { data: guardians }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, student_number, full_name, status")
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .order("full_name", { ascending: true }),
      supabase
        .from("class_enrollments")
        .select("student_id, classes(name, section), grade_levels(name)")
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .eq("status", "active"),
      supabase
        .from("student_guardians")
        .select("student_id, guardian_name, is_primary")
        .eq("tenant_id", context.tenant_id)
        .eq("school_id", context.school_id)
        .order("is_primary", { ascending: false }),
    ])

  const enrollmentByStudent = new Map(
    (enrollments ?? []).map((enrollment) => [enrollment.student_id, enrollment])
  )
  const guardianByStudent = new Map(
    (guardians ?? []).map((guardian) => [guardian.student_id, guardian])
  )

  return (students ?? []).map((student) => {
    const enrollment = enrollmentByStudent.get(student.id)
    const classSection = Array.isArray(enrollment?.classes)
      ? enrollment?.classes[0]
      : enrollment?.classes
    const gradeLevel = Array.isArray(enrollment?.grade_levels)
      ? enrollment?.grade_levels[0]
      : enrollment?.grade_levels
    const guardian = guardianByStudent.get(student.id)

    return {
      student_number: student.student_number,
      student_name: student.full_name,
      status: STUDENT_STATUS_LABELS_AR[student.status],
      grade_level: gradeLevel?.name ?? null,
      class_name: classSection?.name ?? null,
      guardian: guardian?.guardian_name ?? null,
    }
  })
}
