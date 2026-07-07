import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { assertStudentCareStudent } from "@/lib/student-care/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { StudentCareContext } from "@/lib/student-care/context"
import type { TablesInsert } from "@/types/database"
import type { DisciplineRecord } from "@/types/student-care"

function canReviewDiscipline(context: StudentCareContext) {
  return (
    context.role === USER_ROLES.SYSTEM_ADMIN ||
    context.role === USER_ROLES.SCHOOL_ADMIN
  )
}

export type CreateDisciplineRecordInput = {
  student_id: string
  incident_date: string
  incident_type: DisciplineRecord["incident_type"]
  severity: DisciplineRecord["severity"]
  title: string
  description: string
  action_taken: string | null
}

export type ReviewDisciplineRecordInput = {
  record_id: string
  status: "reviewed" | "resolved"
}

export type DisciplineRecordListItem = DisciplineRecord & {
  students: { full_name: string; student_number: string } | null
  reported_by: { full_name: string } | null
  reviewed_by: { full_name: string } | null
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function assertDisciplineRecord(
  context: StudentCareContext,
  recordId: string
): Promise<DisciplineRecord> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("discipline_records")
    .select("*")
    .eq("id", recordId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("DISCIPLINE_RECORD_NOT_FOUND")
  }

  return data
}

export async function listDisciplineRecords(
  context: StudentCareContext,
  options?: { actorOnly?: boolean; limit?: number }
): Promise<DisciplineRecordListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("discipline_records")
    .select(
      "*, students(full_name, student_number), reported_by:user_profiles!discipline_records_reported_by_user_id_fkey(full_name), reviewed_by:user_profiles!discipline_records_reviewed_by_user_id_fkey(full_name)"
    )
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("incident_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (options?.actorOnly) {
    query = query.eq("reported_by_user_id", context.user_id)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data as unknown as DisciplineRecordListItem[]
}

export async function createDisciplineRecord(
  context: StudentCareContext,
  input: CreateDisciplineRecordInput
): Promise<DisciplineRecord> {
  await assertStudentCareStudent(context, input.student_id, {
    requireActive: true,
  })

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"discipline_records"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    student_id: input.student_id,
    incident_date: input.incident_date,
    incident_type: input.incident_type,
    severity: input.severity,
    title: input.title.trim(),
    description: input.description.trim(),
    action_taken: trimToNull(input.action_taken),
    status: "submitted",
    reported_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("discipline_records")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function reviewDisciplineRecord(
  context: StudentCareContext,
  input: ReviewDisciplineRecordInput
): Promise<DisciplineRecord> {
  if (!canReviewDiscipline(context)) {
    throw new Error("DISCIPLINE_REVIEW_NOT_ALLOWED")
  }

  const record = await assertDisciplineRecord(context, input.record_id)

  if (record.status === "resolved" || record.status === "cancelled") {
    throw new Error("DISCIPLINE_ALREADY_FINALIZED")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("discipline_records")
    .update({
      status: input.status,
      reviewed_by_user_id: context.user_id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", record.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function countOpenDisciplineRecords(
  context: StudentCareContext,
  options?: { actorOnly?: boolean }
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("discipline_records")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .not("status", "in", '("resolved","cancelled")')

  if (options?.actorOnly) {
    query = query.eq("reported_by_user_id", context.user_id)
  }

  const { count, error } = await query

  return error ? 0 : count ?? 0
}
