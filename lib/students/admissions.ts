import "server-only"

import { USER_ROLES } from "@/constants/roles"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/types/database"
import type {
  AdmissionStatus,
  GuardianRelation,
  StudentAdmission,
  StudentGender,
} from "@/types/students"
import type { StudentModuleContext } from "@/lib/students/context"

export type CreateAdmissionInput = {
  student_first_name: string
  student_middle_name: string | null
  student_last_name: string
  gender: StudentGender | null
  birth_date: string | null
  nationality: string | null
  guardian_name: string
  guardian_email: string | null
  guardian_phone: string
  guardian_relation: GuardianRelation
  notes: string | null
}

export type UpdateAdmissionStatusInput = {
  status: Extract<AdmissionStatus, "pending" | "rejected" | "cancelled">
  decision_notes: string | null
}

type ApprovalResult = {
  student_id: string
  student_number: string
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

function buildStudentFullName(input: {
  student_first_name: string
  student_middle_name: string | null
  student_last_name: string
}): string {
  return [
    input.student_first_name.trim(),
    trimToNull(input.student_middle_name),
    input.student_last_name.trim(),
  ]
    .filter(Boolean)
    .join(" ")
}

export async function listAdmissions(
  context: StudentModuleContext
): Promise<StudentAdmission[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("student_admissions")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("created_at", { ascending: false })

  if (context.role === USER_ROLES.PARENT) {
    query = query.eq("submitted_by_user_id", context.user_id)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function getAdmissionById(
  context: StudentModuleContext,
  admissionId: string
): Promise<StudentAdmission | null> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("student_admissions")
    .select("*")
    .eq("id", admissionId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (context.role === USER_ROLES.PARENT) {
    query = query.eq("submitted_by_user_id", context.user_id)
  }

  const { data, error } = await query.maybeSingle()

  if (error || !data) {
    return null
  }

  return data
}

export async function createAdmission(
  context: StudentModuleContext,
  input: CreateAdmissionInput
): Promise<StudentAdmission> {
  const supabase = await createSupabaseServerClient()

  const admissionRecord: TablesInsert<"student_admissions"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    submitted_by_user_id: context.user_id,
    student_first_name: input.student_first_name.trim(),
    student_middle_name: trimToNull(input.student_middle_name),
    student_last_name: input.student_last_name.trim(),
    student_full_name: buildStudentFullName(input),
    gender: input.gender,
    birth_date: input.birth_date,
    nationality: trimToNull(input.nationality),
    guardian_name: input.guardian_name.trim(),
    guardian_email: trimToNull(input.guardian_email),
    guardian_phone: input.guardian_phone.trim(),
    guardian_relation: input.guardian_relation,
    notes: trimToNull(input.notes),
  }

  const { data, error } = await supabase
    .from("student_admissions")
    .insert(admissionRecord)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdmissionStatus(
  context: StudentModuleContext,
  admissionId: string,
  input: UpdateAdmissionStatusInput
): Promise<StudentAdmission | null> {
  const supabase = await createSupabaseServerClient()

  const updatePayload =
    input.status === "pending"
      ? {
          status: input.status,
          decision_notes: null,
          reviewed_by_user_id: null,
          reviewed_at: null,
        }
      : {
          status: input.status,
          decision_notes: trimToNull(input.decision_notes),
          reviewed_by_user_id: context.user_id,
          reviewed_at: new Date().toISOString(),
        }

  const { data, error } = await supabase
    .from("student_admissions")
    .update(updatePayload)
    .eq("id", admissionId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function approveAdmissionAndCreateStudent(
  context: StudentModuleContext,
  admissionId: string,
  decisionNotes: string | null
): Promise<ApprovalResult | null> {
  const supabase = await createSupabaseServerClient()
  const admission = await getAdmissionById(context, admissionId)

  if (!admission) {
    return null
  }

  const { data, error } = await supabase.rpc(
    "approve_admission_and_create_student",
    {
      p_admission_id: admissionId,
      p_changed_by_user_id: context.user_id,
      p_decision_notes: trimToNull(decisionNotes) ?? undefined,
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    return null
  }

  return data[0]
}
