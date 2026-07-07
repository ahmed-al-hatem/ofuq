import "server-only"

import { assertStudentCareStudent } from "@/lib/student-care/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { StudentCareContext } from "@/lib/student-care/context"
import type { TablesInsert } from "@/types/database"
import type { ClinicVisit } from "@/types/student-care"

export type CreateClinicVisitInput = {
  student_id: string
  visited_at: string | null
  reason: string
  symptoms: string | null
  action_taken: string | null
  returned_to_class: boolean
  guardian_contacted: boolean
  referred_to_external_care: boolean
  notes: string | null
}

export type ClinicVisitListItem = ClinicVisit & {
  students: { full_name: string; student_number: string } | null
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

async function assertClinicVisit(
  context: StudentCareContext,
  visitId: string
): Promise<ClinicVisit> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("clinic_visits")
    .select("*")
    .eq("id", visitId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("CLINIC_VISIT_NOT_FOUND")
  }

  return data
}

export async function listClinicVisits(
  context: StudentCareContext,
  limit?: number
): Promise<ClinicVisitListItem[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("clinic_visits")
    .select("*, students(full_name, student_number)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("visited_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data as unknown as ClinicVisitListItem[]
}

export async function createClinicVisit(
  context: StudentCareContext,
  input: CreateClinicVisitInput
): Promise<ClinicVisit> {
  await assertStudentCareStudent(context, input.student_id, {
    requireActive: true,
  })

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"clinic_visits"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    student_id: input.student_id,
    visited_at: input.visited_at ?? new Date().toISOString(),
    reason: input.reason.trim(),
    symptoms: trimToNull(input.symptoms),
    action_taken: trimToNull(input.action_taken),
    returned_to_class: input.returned_to_class,
    guardian_contacted: input.guardian_contacted,
    referred_to_external_care: input.referred_to_external_care,
    handled_by_user_id: context.user_id,
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("clinic_visits")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function closeClinicVisit(
  context: StudentCareContext,
  visitId: string
): Promise<ClinicVisit> {
  const visit = await assertClinicVisit(context, visitId)

  if (visit.status !== "open") {
    throw new Error("CLINIC_VISIT_NOT_OPEN")
  }

  const supabase = await createSupabaseServerClient()
  const nextStatus = visit.referred_to_external_care ? "referred" : "closed"
  const { data, error } = await supabase
    .from("clinic_visits")
    .update({
      status: nextStatus,
      closed_at: new Date().toISOString(),
      handled_by_user_id: context.user_id,
    })
    .eq("id", visit.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "open")
    .select("*")
    .single()

  if (error || !data) {
    throw new Error("CLINIC_VISIT_NOT_OPEN")
  }

  return data
}

export async function countOpenClinicVisits(
  context: StudentCareContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("clinic_visits")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "open")

  return error ? 0 : count ?? 0
}
