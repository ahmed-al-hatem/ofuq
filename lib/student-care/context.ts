import "server-only"

import type { UserRole } from "@/constants/roles"
import { success, type ActionResult } from "@/lib/actions/action-result"
import { requireActiveMembership } from "@/lib/actions/require-auth"
import { requireRole } from "@/lib/actions/require-role"
import { requireSchoolContext } from "@/lib/actions/require-tenant"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { UserMembership } from "@/types/auth"
import type { Student } from "@/types/students"

export type StudentCareContext = {
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
  membership: UserMembership
}

export type StudentCareStudentOption = Pick<
  Student,
  "id" | "full_name" | "student_number" | "status"
>

export async function requireStudentCareContext(
  allowedRoles: readonly UserRole[]
): Promise<ActionResult<StudentCareContext>> {
  const membershipResult = await requireActiveMembership()

  if (!membershipResult.ok) {
    return membershipResult
  }

  const roleResult = requireRole(
    membershipResult.data.membership,
    allowedRoles
  )

  if (!roleResult.ok) {
    return roleResult
  }

  const schoolResult = requireSchoolContext(membershipResult.data)

  if (!schoolResult.ok) {
    return schoolResult
  }

  return success({
    user_id: membershipResult.data.id,
    role: roleResult.data.role,
    tenant_id: schoolResult.data.tenant_id,
    school_id: schoolResult.data.school_id,
    membership: membershipResult.data.membership,
  })
}

export async function listStudentCareStudents(
  context: StudentCareContext,
  options?: { activeOnly?: boolean }
): Promise<StudentCareStudentOption[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("students")
    .select("id, full_name, student_number, status")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .order("full_name", { ascending: true })

  if (options?.activeOnly) {
    query = query.eq("status", "active")
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
}

export async function assertStudentCareStudent(
  context: StudentCareContext,
  studentId: string,
  options?: { requireActive?: boolean }
): Promise<Student> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("STUDENT_NOT_FOUND")
  }

  if (options?.requireActive && data.status !== "active") {
    throw new Error("STUDENT_NOT_ACTIVE")
  }

  return data
}
