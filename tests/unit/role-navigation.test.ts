import { USER_ROLES, type UserRole } from "@/constants/roles"
import { dashboardNavigation } from "@/config/navigation"
import { appRoutes } from "@/constants/routes"
import {
  canRoleAccessDashboardNavigation,
  getDashboardNavigationForRole,
} from "@/lib/navigation/role-navigation"

function flattenNavigation(role: UserRole) {
  return getDashboardNavigationForRole(role).flatMap((group) => group.items)
}

describe("role dashboard navigation", () => {
  it("shows the full active admin navigation for system and school admins", () => {
    const expectedAdminRoutes = new Set(
      dashboardNavigation
        .flatMap((group) => group.items)
        .filter((item) => item.href && !item.placeholder)
        .map((item) => item.href)
    )

    expect(new Set(flattenNavigation(USER_ROLES.SYSTEM_ADMIN).map((item) => item.href))).toEqual(
      expectedAdminRoutes
    )
    expect(new Set(flattenNavigation(USER_ROLES.SCHOOL_ADMIN).map((item) => item.href))).toEqual(
      expectedAdminRoutes
    )
  })

  it("keeps teacher navigation limited to teacher-relevant modules", () => {
    const teacherRoutes = new Set(
      flattenNavigation(USER_ROLES.TEACHER).map((item) => item.href)
    )

    expect(teacherRoutes).toEqual(
      new Set([
        appRoutes.dashboard,
        appRoutes.attendance,
        appRoutes.grades,
        appRoutes.timetable,
        appRoutes.communication,
        appRoutes.dashboardChat,
        appRoutes.dashboardAssistant,
        appRoutes.reports,
      ])
    )

    expect(teacherRoutes.has(appRoutes.finance)).toBe(false)
    expect(teacherRoutes.has(appRoutes.settings)).toBe(false)
    expect(teacherRoutes.has(appRoutes.integrations)).toBe(false)
  })

  it("shows finance-focused navigation for the accountant role", () => {
    const accountantRoutes = new Set(
      flattenNavigation(USER_ROLES.ACCOUNTANT).map((item) => item.href)
    )

    expect(accountantRoutes).toEqual(
      new Set([
        appRoutes.dashboard,
        appRoutes.finance,
        appRoutes.communication,
        appRoutes.dashboardChat,
        appRoutes.dashboardAssistant,
        appRoutes.reports,
      ])
    )

    expect(accountantRoutes.has(appRoutes.admissions)).toBe(false)
    expect(accountantRoutes.has(appRoutes.settings)).toBe(false)
    expect(accountantRoutes.has(appRoutes.integrations)).toBe(false)
    expect(accountantRoutes.has(appRoutes.library)).toBe(false)
    expect(accountantRoutes.has(appRoutes.studentCare)).toBe(false)
  })

  it("shows library-focused navigation for the librarian role", () => {
    const librarianRoutes = new Set(
      flattenNavigation(USER_ROLES.LIBRARIAN).map((item) => item.href)
    )

    expect(librarianRoutes).toEqual(
      new Set([
        appRoutes.dashboard,
        appRoutes.library,
        appRoutes.communication,
        appRoutes.dashboardChat,
        appRoutes.dashboardAssistant,
        appRoutes.reports,
      ])
    )

    expect(librarianRoutes.has(appRoutes.finance)).toBe(false)
    expect(librarianRoutes.has(appRoutes.settings)).toBe(false)
    expect(librarianRoutes.has(appRoutes.integrations)).toBe(false)
    expect(librarianRoutes.has(appRoutes.studentCare)).toBe(false)
  })

  it("returns no dashboard navigation for portal roles", () => {
    expect(getDashboardNavigationForRole(USER_ROLES.PARENT)).toEqual([])
    expect(getDashboardNavigationForRole(USER_ROLES.STUDENT)).toEqual([])
    expect(canRoleAccessDashboardNavigation(USER_ROLES.PARENT)).toBe(false)
    expect(canRoleAccessDashboardNavigation(USER_ROLES.STUDENT)).toBe(false)
  })

  it("keeps rendered navigation items unique, linked, and grouped", () => {
    const roles = Object.values(USER_ROLES)

    for (const role of roles) {
      const navigation = getDashboardNavigationForRole(role)
      const items = navigation.flatMap((group) => group.items)
      const hrefs = items.map((item) => item.href)

      expect(navigation.every((group) => group.items.length > 0)).toBe(true)
      expect(items.every((item) => Boolean(item.href?.trim()))).toBe(true)
      expect(new Set(hrefs).size).toBe(hrefs.length)
    }
  })
})
