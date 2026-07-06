import { failure, success, type ActionResult } from "@/lib/actions/action-result"
import type { UserRole } from "@/constants/roles"

export function hasRequiredRole(
  role: UserRole,
  allowedRoles: readonly UserRole[]
): boolean {
  return allowedRoles.includes(role)
}

export function requireRole(
  role: UserRole | null | undefined,
  allowedRoles: readonly UserRole[]
): ActionResult<{ role: UserRole }> {
  if (!role) {
    return failure("الدور غير متوفر")
  }

  if (!hasRequiredRole(role, allowedRoles)) {
    return failure("ليس لديك صلاحية للوصول إلى هذا الإجراء")
  }

  return success({ role })
}
