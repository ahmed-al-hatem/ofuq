import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  getDefaultRouteForRole,
  isDashboardRole,
} from "@/lib/auth/role-redirects"
import { isPortalRole } from "@/lib/portal/access"

describe("role redirects", () => {
  it("routes each fixed role to the correct default landing page", () => {
    expect(getDefaultRouteForRole(USER_ROLES.SYSTEM_ADMIN)).toBe(appRoutes.dashboard)
    expect(getDefaultRouteForRole(USER_ROLES.SCHOOL_ADMIN)).toBe(appRoutes.dashboard)
    expect(getDefaultRouteForRole(USER_ROLES.TEACHER)).toBe(appRoutes.dashboard)
    expect(getDefaultRouteForRole(USER_ROLES.ACCOUNTANT)).toBe(appRoutes.dashboard)
    expect(getDefaultRouteForRole(USER_ROLES.LIBRARIAN)).toBe(appRoutes.dashboard)
    expect(getDefaultRouteForRole(USER_ROLES.PARENT)).toBe(appRoutes.portal)
    expect(getDefaultRouteForRole(USER_ROLES.STUDENT)).toBe(appRoutes.portal)
  })

  it("keeps portal roles limited to parent and student", () => {
    expect(isPortalRole(USER_ROLES.PARENT)).toBe(true)
    expect(isPortalRole(USER_ROLES.STUDENT)).toBe(true)

    expect(isPortalRole(USER_ROLES.SYSTEM_ADMIN)).toBe(false)
    expect(isPortalRole(USER_ROLES.SCHOOL_ADMIN)).toBe(false)
    expect(isPortalRole(USER_ROLES.TEACHER)).toBe(false)
    expect(isPortalRole(USER_ROLES.ACCOUNTANT)).toBe(false)
    expect(isPortalRole(USER_ROLES.LIBRARIAN)).toBe(false)
  })

  it("treats staff and admin roles as dashboard roles", () => {
    expect(isDashboardRole(USER_ROLES.SYSTEM_ADMIN)).toBe(true)
    expect(isDashboardRole(USER_ROLES.SCHOOL_ADMIN)).toBe(true)
    expect(isDashboardRole(USER_ROLES.TEACHER)).toBe(true)
    expect(isDashboardRole(USER_ROLES.ACCOUNTANT)).toBe(true)
    expect(isDashboardRole(USER_ROLES.LIBRARIAN)).toBe(true)

    expect(isDashboardRole(USER_ROLES.PARENT)).toBe(false)
    expect(isDashboardRole(USER_ROLES.STUDENT)).toBe(false)
  })
})
