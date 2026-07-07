import "server-only"

import type { UserRole } from "@/constants/roles"
import { USER_ROLES } from "@/constants/roles"
import { success, type ActionResult } from "@/lib/actions/action-result"
import { requireActiveMembership } from "@/lib/actions/require-auth"
import { requireRole } from "@/lib/actions/require-role"
import { requireSchoolContext } from "@/lib/actions/require-tenant"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { UserMembership } from "@/types/auth"
import type { Student } from "@/types/students"

export const feedbackManagementRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

export const feedbackStaffRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

export const feedbackSurveyResponseRoles = feedbackStaffRoles

export type FeedbackContext = {
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
  membership: UserMembership
}

export type FeedbackStudentOption = Pick<
  Student,
  "id" | "full_name" | "student_number" | "status"
>

export type FeedbackUserOption = {
  id: string
  full_name: string
  display_name: string | null
  role: UserRole
}

export async function requireFeedbackContext(
  allowedRoles: readonly UserRole[]
): Promise<ActionResult<FeedbackContext>> {
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

export async function listFeedbackStudents(
  context: FeedbackContext,
  options?: { activeOnly?: boolean }
): Promise<FeedbackStudentOption[]> {
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

export async function listFeedbackUserOptions(
  context: FeedbackContext,
  options?: { excludeCurrentUser?: boolean }
): Promise<FeedbackUserOption[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("user_memberships")
    .select("user_id, role, user_profiles(full_name, display_name)")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .eq("status", "active")
    .in("role", [...feedbackStaffRoles])
    .order("role", { ascending: true })

  if (options?.excludeCurrentUser) {
    query = query.neq("user_id", context.user_id)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data
    .map((membership) => {
      const profile = Array.isArray(membership.user_profiles)
        ? membership.user_profiles[0]
        : membership.user_profiles

      if (!profile) {
        return null
      }

      return {
        id: membership.user_id,
        full_name: profile.full_name,
        display_name: profile.display_name,
        role: membership.role,
      }
    })
    .filter(Boolean) as FeedbackUserOption[]
}
