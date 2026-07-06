import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AttendanceModuleContext } from "@/lib/attendance/context"
import type { TablesInsert } from "@/types/database"
import type {
  AttendanceSession,
  AttendanceSessionMethod,
} from "@/types/attendance"

export type CreateAttendanceSessionInput = {
  academic_year_id: string
  term_id: string | null
  class_id: string
  session_date: string
  starts_at: string | null
  ends_at: string | null
  method: AttendanceSessionMethod
  notes: string | null
}

export type AttendanceSessionListItem = AttendanceSession & {
  classes: { name: string; section: string } | null
  academic_years: { name: string } | null
  terms: { name: string } | null
  user_profiles: { full_name: string } | null
  attendance_records: { count: number }[]
}

export type AttendanceSessionDetails = AttendanceSession & {
  classes: { name: string; section: string } | null
  academic_years: { name: string } | null
  terms: { name: string } | null
  user_profiles: { full_name: string } | null
}

export type EnrolledAttendanceStudent = {
  id: string
  student_id: string
  academic_year_id: string
  class_id: string
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
  context: AttendanceModuleContext,
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
  context: AttendanceModuleContext,
  classId: string,
  academicYearId: string
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("classes")
    .select("id, academic_year_id")
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
}

async function assertTermForYear(
  context: AttendanceModuleContext,
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

export async function listAttendanceSessions(
  context: AttendanceModuleContext,
  limit = 50
): Promise<AttendanceSessionListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(
      "*, classes(name, section), academic_years(name), terms(name), user_profiles(full_name), attendance_records(count)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as unknown as AttendanceSessionListItem[]
}

export async function listTodaysAttendanceSessions(
  context: AttendanceModuleContext
): Promise<AttendanceSession[]> {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("session_date", today)

  if (error || !data) {
    return []
  }

  return data
}

export async function getAttendanceSessionById(
  context: AttendanceModuleContext,
  sessionId: string
): Promise<AttendanceSessionDetails> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*, classes(name, section), academic_years(name), terms(name), user_profiles(full_name)")
    .eq("id", sessionId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("ATTENDANCE_SESSION_NOT_FOUND")
  }

  return data as unknown as AttendanceSessionDetails
}

export async function createAttendanceSession(
  context: AttendanceModuleContext,
  input: CreateAttendanceSessionInput
): Promise<AttendanceSession> {
  const supabase = await createSupabaseServerClient()
  await assertAcademicYear(context, input.academic_year_id)
  await assertClassForYear(context, input.class_id, input.academic_year_id)

  if (input.term_id) {
    await assertTermForYear(context, input.term_id, input.academic_year_id)
  }

  const sessionRecord: TablesInsert<"attendance_sessions"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    academic_year_id: input.academic_year_id,
    term_id: input.term_id,
    class_id: input.class_id,
    taken_by_user_id: context.user_id,
    session_date: input.session_date,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    method: input.method,
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert(sessionRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function closeAttendanceSession(
  context: AttendanceModuleContext,
  sessionId: string
): Promise<AttendanceSession> {
  const supabase = await createSupabaseServerClient()
  const session = await getAttendanceSessionById(context, sessionId)

  if (session.status !== "open") {
    throw new Error("ATTENDANCE_SESSION_NOT_OPEN")
  }

  const { data, error } = await supabase
    .from("attendance_sessions")
    .update({ status: "closed" })
    .eq("id", sessionId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function loadEnrolledStudentsForSession(
  context: AttendanceModuleContext,
  sessionId: string
): Promise<EnrolledAttendanceStudent[]> {
  const session = await getAttendanceSessionById(context, sessionId)
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("id, student_id, academic_year_id, class_id, students(id, full_name, student_number, status)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("academic_year_id", session.academic_year_id)
    .eq("class_id", session.class_id)
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
  })) as EnrolledAttendanceStudent[]
}
