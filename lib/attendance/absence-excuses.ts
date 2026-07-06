import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AttendanceModuleContext } from "@/lib/attendance/context"
import type { TablesInsert } from "@/types/database"
import type { AbsenceExcuse, AbsenceExcuseStatus } from "@/types/attendance"

export type AbsenceExcuseListItem = AbsenceExcuse & {
  students: { full_name: string; student_number: string } | null
  attendance_records: {
    status: string
    attendance_sessions: { session_date: string } | null
  } | null
}

export type SubmitAbsenceExcuseInput = {
  attendance_record_id: string
  reason: string
}

export type ReviewAbsenceExcuseInput = {
  excuse_id: string
  status: Extract<AbsenceExcuseStatus, "approved" | "rejected">
  review_notes: string | null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

export async function listAbsenceExcuses(
  context: AttendanceModuleContext
): Promise<AbsenceExcuseListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("absence_excuses")
    .select(
      "*, students(full_name, student_number), attendance_records(status, attendance_sessions(session_date))"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("submitted_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as AbsenceExcuseListItem[]
}

export async function submitAbsenceExcuse(
  context: AttendanceModuleContext,
  input: SubmitAbsenceExcuseInput
): Promise<AbsenceExcuse> {
  const supabase = await createSupabaseServerClient()
  const { data: record, error: recordError } = await supabase
    .from("attendance_records")
    .select("id, student_id, status")
    .eq("id", input.attendance_record_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (recordError || !record) {
    throw new Error("ATTENDANCE_RECORD_NOT_FOUND")
  }

  if (record.status !== "absent" && record.status !== "late") {
    throw new Error("ATTENDANCE_RECORD_NOT_EXCUSABLE")
  }

  const excuseRecord: TablesInsert<"absence_excuses"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    attendance_record_id: record.id,
    student_id: record.student_id,
    submitted_by_user_id: context.user_id,
    reason: input.reason.trim(),
  }

  const { data, error } = await supabase
    .from("absence_excuses")
    .insert(excuseRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function reviewAbsenceExcuse(
  context: AttendanceModuleContext,
  input: ReviewAbsenceExcuseInput
): Promise<AbsenceExcuse> {
  const supabase = await createSupabaseServerClient()
  const { data: excuse, error: excuseError } = await supabase
    .from("absence_excuses")
    .select("*, attendance_records(id, status)")
    .eq("id", input.excuse_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (excuseError || !excuse) {
    throw new Error("ABSENCE_EXCUSE_NOT_FOUND")
  }

  const relatedRecord = Array.isArray(excuse.attendance_records)
    ? excuse.attendance_records[0]
    : excuse.attendance_records

  if (!relatedRecord) {
    throw new Error("ATTENDANCE_RECORD_NOT_FOUND")
  }

  const { data, error } = await supabase
    .from("absence_excuses")
    .update({
      status: input.status,
      reviewed_by_user_id: context.user_id,
      reviewed_at: new Date().toISOString(),
      review_notes: trimToNull(input.review_notes),
    })
    .eq("id", input.excuse_id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (
    input.status === "approved" &&
    (relatedRecord.status === "absent" || relatedRecord.status === "late")
  ) {
    await supabase
      .from("attendance_records")
      .update({ status: "excused" })
      .eq("id", relatedRecord.id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
  }

  return data
}
