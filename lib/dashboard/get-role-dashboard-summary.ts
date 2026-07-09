import "server-only"

import { USER_ROLES } from "@/constants/roles"
import type { AuthenticatedUser } from "@/types/auth"
import type { RoleDashboardSummary } from "@/types/dashboard"
import { createDashboardScope } from "@/lib/dashboard/shared"
import { getAdminDashboardSummary } from "@/lib/dashboard/admin-summary"
import { getTeacherDashboardSummary } from "@/lib/dashboard/teacher-summary"
import { getAccountantDashboardSummary } from "@/lib/dashboard/accountant-summary"
import { getLibrarianDashboardSummary } from "@/lib/dashboard/librarian-summary"

export async function getRoleDashboardSummary(
  user: AuthenticatedUser
): Promise<RoleDashboardSummary | null> {
  if (!user.membership || user.membership.status !== "active") {
    return null
  }

  const scope = createDashboardScope({
    ...user,
    membership: user.membership,
  })

  if (!scope) {
    return null
  }

  switch (scope.role) {
    case USER_ROLES.SYSTEM_ADMIN:
    case USER_ROLES.SCHOOL_ADMIN:
      return {
        role: scope.role,
        data: await getAdminDashboardSummary(scope),
      }
    case USER_ROLES.TEACHER:
      return {
        role: scope.role,
        data: await getTeacherDashboardSummary(scope),
      }
    case USER_ROLES.ACCOUNTANT:
      return {
        role: scope.role,
        data: await getAccountantDashboardSummary(scope),
      }
    case USER_ROLES.LIBRARIAN:
      return {
        role: scope.role,
        data: await getLibrarianDashboardSummary(scope),
      }
    default:
      return null
  }
}
