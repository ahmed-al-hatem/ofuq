import "server-only"

import { assertStudentCareStudent, listStudentCareStudents } from "@/lib/student-care/context"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TablesInsert, TablesUpdate } from "@/types/database"
import type { HealthRecord } from "@/types/student-care"
import type { Student } from "@/types/students"
import type { StudentCareContext } from "@/lib/student-care/context"

export type UpsertHealthRecordInput = {
  student_id: string
  blood_type: string | null
  allergies: string | null
  chronic_conditions: string | null
  medications: string | null
  emergency_notes: string | null
  doctor_name: string | null
  doctor_phone: string | null
}

export type HealthRecordListItem = {
  student: {
    id: string
    full_name: string
    student_number: string
    status: Student["status"]
  }
  health_record: HealthRecord | null
}

export type StudentHealthRecordDetail = {
  student: Student
  health_record: HealthRecord | null
}

function trimToNull(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

export async function listHealthRecords(
  context: StudentCareContext
): Promise<HealthRecordListItem[]> {
  const [students, supabase] = await Promise.all([
    listStudentCareStudents(context, { activeOnly: true }),
    createSupabaseServerClient(),
  ])
  const { data: records } = await supabase
    .from("health_records")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })

  const recordsByStudent = new Map(
    (records ?? []).map((record) => [record.student_id, record])
  )

  return students.map((student) => ({
    student,
    health_record: recordsByStudent.get(student.id) ?? null,
  }))
}

export async function loadStudentHealthRecordDetail(
  context: StudentCareContext,
  studentId: string
): Promise<StudentHealthRecordDetail | null> {
  const student = await assertStudentCareStudent(context, studentId).catch(
    () => null
  )

  if (!student) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data: healthRecord } = await supabase
    .from("health_records")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("student_id", student.id)
    .eq("status", "active")
    .maybeSingle()

  return {
    student,
    health_record: healthRecord ?? null,
  }
}

export async function upsertHealthRecord(
  context: StudentCareContext,
  input: UpsertHealthRecordInput
): Promise<HealthRecord> {
  await assertStudentCareStudent(context, input.student_id, {
    requireActive: true,
  })
  const supabase = await createSupabaseServerClient()
  const { data: existingRecord, error: existingRecordError } = await supabase
    .from("health_records")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("student_id", input.student_id)
    .eq("status", "active")
    .maybeSingle()

  if (existingRecordError) {
    throw new Error(existingRecordError.message)
  }

  const payload = {
    blood_type: trimToNull(input.blood_type),
    allergies: trimToNull(input.allergies),
    chronic_conditions: trimToNull(input.chronic_conditions),
    medications: trimToNull(input.medications),
    emergency_notes: trimToNull(input.emergency_notes),
    doctor_name: trimToNull(input.doctor_name),
    doctor_phone: trimToNull(input.doctor_phone),
  }

  if (existingRecord) {
    const updatePayload: TablesUpdate<"health_records"> = {
      ...payload,
      updated_by_user_id: context.user_id,
    }
    const { data, error } = await supabase
      .from("health_records")
      .update(updatePayload)
      .eq("id", existingRecord.id)
      .eq("tenant_id", context.tenant_id)
      .eq("school_id", context.school_id)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const insertPayload: TablesInsert<"health_records"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    student_id: input.student_id,
    status: "active",
    created_by_user_id: context.user_id,
    updated_by_user_id: context.user_id,
    ...payload,
  }
  const { data, error } = await supabase
    .from("health_records")
    .insert(insertPayload)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function countActiveHealthRecords(
  context: StudentCareContext
): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("health_records")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")

  return error ? 0 : count ?? 0
}
