import {
  ROLE_GROUPS,
  USER_ROLE_LABELS_AR,
  USER_ROLES,
  isUserRole,
  roleInGroup,
} from "@/constants/roles"
import { hasRequiredRole, requireRole } from "@/lib/actions/require-role"

describe("fixed roles", () => {
  const expectedRoles = [
    "system_admin",
    "school_admin",
    "teacher",
    "parent",
    "student",
    "accountant",
    "librarian",
  ] as const

  it("exports the full MVP fixed role set", () => {
    expect(Object.values(USER_ROLES)).toEqual(expectedRoles)
  })

  it("provides Arabic labels for every fixed role", () => {
    for (const role of expectedRoles) {
      expect(USER_ROLE_LABELS_AR[role].trim().length).toBeGreaterThan(0)
      expect(isUserRole(role)).toBe(true)
    }

    expect(isUserRole("principal")).toBe(false)
  })

  it("keeps role groups aligned with the exported role set", () => {
    const groupedRoles = Object.values(ROLE_GROUPS).flat()

    expect(new Set(groupedRoles)).toEqual(new Set(expectedRoles))
    expect(roleInGroup(USER_ROLES.SYSTEM_ADMIN, "administration")).toBe(true)
    expect(roleInGroup(USER_ROLES.TEACHER, "education")).toBe(true)
    expect(roleInGroup(USER_ROLES.LIBRARIAN, "operations")).toBe(true)
  })

  it("applies allow-list checks through requireRole", () => {
    expect(
      hasRequiredRole(USER_ROLES.ACCOUNTANT, [
        USER_ROLES.SYSTEM_ADMIN,
        USER_ROLES.ACCOUNTANT,
      ])
    ).toBe(true)

    expect(
      requireRole(
        { role: USER_ROLES.TEACHER, status: "active" },
        [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.TEACHER]
      )
    ).toEqual({
      ok: true,
      data: { role: USER_ROLES.TEACHER },
    })

    expect(
      requireRole(
        { role: USER_ROLES.TEACHER, status: "inactive" },
        [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.TEACHER]
      )
    ).toEqual({
      ok: false,
      error: "العضوية الحالية غير نشطة",
    })
  })
})
