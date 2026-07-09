import { USER_ROLES, type UserRole } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { isPortalRole } from "@/lib/portal/access"

export function isDashboardRole(role: UserRole): boolean {
  return !isPortalRole(role)
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ACCOUNTANT:
      return appRoutes.dashboard
    case USER_ROLES.LIBRARIAN:
      return appRoutes.dashboard
    case USER_ROLES.PARENT:
    case USER_ROLES.STUDENT:
      return appRoutes.portal
    case USER_ROLES.SYSTEM_ADMIN:
    case USER_ROLES.SCHOOL_ADMIN:
    case USER_ROLES.TEACHER:
      return appRoutes.dashboard
  }
}
