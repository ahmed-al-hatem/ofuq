import "server-only"

import { assertStudentCareStudent } from "@/lib/student-care/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { StudentCareContext } from "@/lib/student-care/context"
import type { TablesInsert } from "@/types/database"
import type { Vaccination } from "@/types/student-care"

export type CreateVaccinationInput = {
  student_id: string
  vaccine_name: string
  dose_label: string | null
  vaccinated_on: string | null
  next_due_on: string | null
  status: Vaccination["status"]
  notes: string | null
}

export type VaccinationListItem = Vaccination & {
  students: { full_name: string; student_number: string } | null
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

export async function listVaccinations(
  context: StudentCareContext
): Promise<VaccinationListItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("vaccinations")
    .select("*, students(full_name, student_number)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as unknown as VaccinationListItem[]
}

export async function createVaccination(
  context: StudentCareContext,
  input: CreateVaccinationInput
): Promise<Vaccination> {
  await assertStudentCareStudent(context, input.student_id, {
    requireActive: true,
  })

  const supabase = await createSupabaseServerClient()
  const record: TablesInsert<"vaccinations"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    student_id: input.student_id,
    vaccine_name: input.vaccine_name.trim(),
    dose_label: trimToNull(input.dose_label),
    vaccinated_on: input.vaccinated_on,
    next_due_on: input.next_due_on,
    status: input.status,
    notes: trimToNull(input.notes),
    recorded_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("vaccinations")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function countVaccinations(
  context: StudentCareContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("vaccinations")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  return error ? 0 : count ?? 0
}
