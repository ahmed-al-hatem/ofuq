import { failure, success, type ActionResult } from "@/lib/actions/action-result"
import type { UserRole } from "@/constants/roles"
import type { MembershipStatus } from "@/types/auth"

export function hasRequiredRole(
  role: UserRole,
  allowedRoles: readonly UserRole[]
): boolean {
  return allowedRoles.includes(role)
}

export type RoleContext = {
  role: UserRole | null | undefined
  status?: MembershipStatus | null
}

export function requireRole(
  context: RoleContext | null | undefined,
  allowedRoles: readonly UserRole[]
): ActionResult<{ role: UserRole }> {
  const role = context?.role

  if (!role) {
    return failure("الدور غير متوفر")
  }

  if (context?.status && context.status !== "active") {
    return failure("العضوية الحالية غير نشطة")
  }

  if (!hasRequiredRole(role, allowedRoles)) {
    return failure("ليس لديك صلاحية للوصول إلى هذا الإجراء")
  }

  return success({ role })
}
