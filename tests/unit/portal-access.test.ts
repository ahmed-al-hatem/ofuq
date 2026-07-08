import { USER_ROLES } from "@/constants/roles"
import {
  canUseParentFinancialView,
  hasPortalStudentAccess,
  isPortalRole,
} from "@/lib/portal/access"

describe("portal access helpers", () => {
  it("limits portal roles to parent and student only", () => {
    expect(isPortalRole(USER_ROLES.PARENT)).toBe(true)
    expect(isPortalRole(USER_ROLES.STUDENT)).toBe(true)
    expect(isPortalRole(USER_ROLES.SYSTEM_ADMIN)).toBe(false)
    expect(isPortalRole(USER_ROLES.SCHOOL_ADMIN)).toBe(false)
    expect(isPortalRole(USER_ROLES.TEACHER)).toBe(false)
    expect(isPortalRole(USER_ROLES.ACCOUNTANT)).toBe(false)
    expect(isPortalRole(USER_ROLES.LIBRARIAN)).toBe(false)
  })

  it("allows detailed financial view for parent only", () => {
    expect(canUseParentFinancialView(USER_ROLES.PARENT)).toBe(true)
    expect(canUseParentFinancialView(USER_ROLES.STUDENT)).toBe(false)
  })

  it("checks linked student scope without trusting a raw student id", () => {
    const scope = {
      linked_student_ids: ["stu_1", "stu_2"],
    }

    expect(hasPortalStudentAccess(scope, "stu_1")).toBe(true)
    expect(hasPortalStudentAccess(scope, "stu_3")).toBe(false)
  })
})
