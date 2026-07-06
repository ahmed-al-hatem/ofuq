import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AttendanceModuleContext } from "@/lib/attendance/context"
import { getAttendanceSessionById } from "@/lib/attendance/attendance-sessions"
import type { TablesInsert } from "@/types/database"
import type {
  AttendanceRecord,
  AttendanceRecordMethod,
  AttendanceStatus,
} from "@/types/attendance"

export type AttendanceRecordListItem = AttendanceRecord & {
  students: { full_name: string; student_number: string } | null
}

export type RecordAttendanceInput = {
  attendance_session_id: string
  student_id: string
  status: AttendanceStatus
  method: AttendanceRecordMethod
  notes: string | null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function resolveActiveEnrollmentForSession(
  context: AttendanceModuleContext,
  input: {
    attendance_session_id: string
    student_id: string
  }
) {
  const session = await getAttendanceSessionById(
    context,
    input.attendance_session_id
  )

  if (session.status !== "open") {
    throw new Error("ATTENDANCE_SESSION_NOT_OPEN")
  }

  const supabase = await createSupabaseServerClient()
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
    .eq("academic_year_id", session.academic_year_id)
    .eq("class_id", session.class_id)
    .eq("student_id", input.student_id)
    .eq("status", "active")
    .maybeSingle()

  if (enrollmentError || !enrollment) {
    throw new Error("ACTIVE_ENROLLMENT_NOT_FOUND")
  }

  return {
    session,
    class_enrollment_id: enrollment.id,
  }
}

export async function listAttendanceRecordsForSession(
  context: AttendanceModuleContext,
  sessionId: string
): Promise<AttendanceRecordListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*, students(full_name, student_number)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("attendance_session_id", sessionId)
    .order("recorded_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as AttendanceRecordListItem[]
}

export async function recordManualAttendance(
  context: AttendanceModuleContext,
  input: Omit<RecordAttendanceInput, "method">
): Promise<AttendanceRecord> {
  return recordAttendance(context, {
    ...input,
    method: "manual",
  })
}

export async function recordQrAttendance(
  context: AttendanceModuleContext,
  input: {
    attendance_session_id: string
    qr_token: string
  }
): Promise<AttendanceRecord> {
  const supabase = await createSupabaseServerClient()
  const { data: student, error } = await supabase
    .from("students")
    .select("id, status")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("qr_token", input.qr_token)
    .maybeSingle()

  if (error || !student) {
    throw new Error("QR_STUDENT_NOT_FOUND")
  }

  if (student.status !== "active") {
    throw new Error("STUDENT_NOT_ACTIVE")
  }

  return recordAttendance(context, {
    attendance_session_id: input.attendance_session_id,
    student_id: student.id,
    status: "present",
    method: "qr",
    notes: null,
  })
}

async function recordAttendance(
  context: AttendanceModuleContext,
  input: RecordAttendanceInput
): Promise<AttendanceRecord> {
  const supabase = await createSupabaseServerClient()
  const { session, class_enrollment_id } =
    await resolveActiveEnrollmentForSession(context, input)

  const record: TablesInsert<"attendance_records"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    attendance_session_id: session.id,
    academic_year_id: session.academic_year_id,
    class_id: session.class_id,
    student_id: input.student_id,
    class_enrollment_id,
    status: input.status,
    method: input.method,
    recorded_by_user_id: context.user_id,
    recorded_at: new Date().toISOString(),
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .upsert(record, { onConflict: "attendance_session_id,student_id" })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
