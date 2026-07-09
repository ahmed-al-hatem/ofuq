import { USER_ROLES, type UserRole } from "@/constants/roles"
import {
  buildAccountantDashboardSummary,
  buildAdminDashboardSummary,
  buildLibrarianDashboardSummary,
  buildTeacherDashboardSummary,
} from "@/lib/dashboard/builders"
import { getDashboardQuickActionsForRole } from "@/lib/dashboard/quick-actions"
import { getDashboardNavigationForRole } from "@/lib/navigation/role-navigation"

function getAllowedRoutes(role: UserRole) {
  return new Set(
    getDashboardNavigationForRole(role)
      .flatMap((group) => group.items)
      .map((item) => item.href)
      .filter((href): href is string => Boolean(href))
  )
}

describe("dashboard summaries", () => {
  it("builds an admin summary without portal-only fields", () => {
    const summary = buildAdminDashboardSummary(
      {
        activeStudentsCount: 24,
        pendingAdmissionsCount: 3,
      },
      USER_ROLES.SCHOOL_ADMIN
    )

    expect(summary.activeStudentsCount).toBe(24)
    expect(summary.pendingAdmissionsCount).toBe(3)
    expect(summary.quickActions.length).toBeGreaterThan(0)
    expect("linkedChildren" in summary).toBe(false)
    expect("libraryHighlights" in summary).toBe(false)
  })

  it("builds a teacher summary without finance or library fields", () => {
    const summary = buildTeacherDashboardSummary({
      todayTimetableSlotsCount: 5,
      assignedSubjectsCount: 2,
    })

    expect(summary.todayTimetableSlotsCount).toBe(5)
    expect(summary.assignedSubjectsCount).toBe(2)
    expect(summary.quickActions.length).toBeGreaterThan(0)
    expect("outstandingBalance" in summary).toBe(false)
    expect("recentLoans" in summary).toBe(false)
  })

  it("builds an accountant summary focused on finance fields", () => {
    const summary = buildAccountantDashboardSummary({
      invoicesCount: 11,
      outstandingBalance: 4200,
    })

    expect(summary.invoicesCount).toBe(11)
    expect(summary.outstandingBalance).toBe(4200)
    expect(summary.quickActions.length).toBeGreaterThan(0)
    expect("todayTimetableSlotsCount" in summary).toBe(false)
    expect("catalogCount" in summary).toBe(false)
  })

  it("builds a librarian summary focused on library fields", () => {
    const summary = buildLibrarianDashboardSummary({
      catalogCount: 30,
      overdueLoansCount: 4,
    })

    expect(summary.catalogCount).toBe(30)
    expect(summary.overdueLoansCount).toBe(4)
    expect(summary.quickActions.length).toBeGreaterThan(0)
    expect("outstandingBalance" in summary).toBe(false)
    expect("todayTimetableSlotsCount" in summary).toBe(false)
  })

  it("keeps dashboard quick actions within the visible role navigation intent", () => {
    const roles = [
      USER_ROLES.SYSTEM_ADMIN,
      USER_ROLES.SCHOOL_ADMIN,
      USER_ROLES.TEACHER,
      USER_ROLES.ACCOUNTANT,
      USER_ROLES.LIBRARIAN,
    ] as const

    for (const role of roles) {
      const allowedRoutes = getAllowedRoutes(role)
      const quickActions = getDashboardQuickActionsForRole(role)

      expect(quickActions.length).toBeGreaterThan(0)
      expect(
        quickActions.every((action) =>
          [...allowedRoutes].some(
            (route) => action.href === route || action.href.startsWith(`${route}/`)
          )
        )
      ).toBe(true)
    }
  })
})
