import { USER_ROLES, type UserRole } from "@/constants/roles"
import { type NavigationGroup, dashboardNavigation } from "@/config/navigation"
import { appRoutes } from "@/constants/routes"
import { isDashboardRole } from "@/lib/auth/role-redirects"

const TEACHER_NAVIGATION_PATHS = new Set<string>([
  appRoutes.dashboard,
  appRoutes.attendance,
  appRoutes.grades,
  appRoutes.timetable,
  appRoutes.communication,
  appRoutes.dashboardChat,
  appRoutes.dashboardAssistant,
  appRoutes.reports,
])

const ACCOUNTANT_NAVIGATION_PATHS = new Set<string>([
  appRoutes.dashboard,
  appRoutes.finance,
  appRoutes.communication,
  appRoutes.dashboardChat,
  appRoutes.dashboardAssistant,
  appRoutes.reports,
])

const LIBRARIAN_NAVIGATION_PATHS = new Set<string>([
  appRoutes.dashboard,
  appRoutes.library,
  appRoutes.communication,
  appRoutes.dashboardChat,
  appRoutes.dashboardAssistant,
  appRoutes.reports,
])

function getAllowedNavigationPaths(role: UserRole): ReadonlySet<string> | null {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
    case USER_ROLES.SCHOOL_ADMIN:
      return null
    case USER_ROLES.TEACHER:
      return TEACHER_NAVIGATION_PATHS
    case USER_ROLES.ACCOUNTANT:
      return ACCOUNTANT_NAVIGATION_PATHS
    case USER_ROLES.LIBRARIAN:
      return LIBRARIAN_NAVIGATION_PATHS
    case USER_ROLES.PARENT:
    case USER_ROLES.STUDENT:
      return new Set<string>()
  }
}

export function canRoleAccessDashboardNavigation(role: UserRole): boolean {
  return isDashboardRole(role)
}

export function getDashboardNavigationForRole(role: UserRole): NavigationGroup[] {
  if (!canRoleAccessDashboardNavigation(role)) {
    return []
  }

  const allowedPaths = getAllowedNavigationPaths(role)

  return dashboardNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.placeholder || !item.href) {
          return false
        }

        return allowedPaths === null || allowedPaths.has(item.href)
      }),
    }))
    .filter((group) => group.items.length > 0)
}
