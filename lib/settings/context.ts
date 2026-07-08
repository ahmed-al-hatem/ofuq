import "server-only"

import type { UserRole } from "@/constants/roles"
import { success, type ActionResult } from "@/lib/actions/action-result"
import { requireActiveMembership } from "@/lib/actions/require-auth"
import { requireRole } from "@/lib/actions/require-role"
import { requireSchoolContext } from "@/lib/actions/require-tenant"
import type { UserMembership } from "@/types/auth"

export type SettingsContext = {
  user_id: string
  role: UserRole
  tenant_id: string
  school_id: string
  membership: UserMembership
}

export async function requireSettingsContext(
  allowedRoles: readonly UserRole[]
): Promise<ActionResult<SettingsContext>> {
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
