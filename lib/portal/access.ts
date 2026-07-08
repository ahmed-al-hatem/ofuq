import { USER_ROLES } from "@/constants/roles"
import type { PortalRole } from "@/types/portal"

const PORTAL_ROLES = [USER_ROLES.PARENT, USER_ROLES.STUDENT] as const

type PortalStudentScope = {
  linked_student_ids: readonly string[]
}

export function isPortalRole(
  role: string | null | undefined
): role is PortalRole {
  return PORTAL_ROLES.includes(role as PortalRole)
}

export function canUseParentFinancialView(role: PortalRole): boolean {
  return role === USER_ROLES.PARENT
}

export function hasPortalStudentAccess(
  scope: PortalStudentScope,
  studentId: string
): boolean {
  return scope.linked_student_ids.includes(studentId)
}
