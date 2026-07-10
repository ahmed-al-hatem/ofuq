import { describe, expect, it } from "vitest"

import { USER_ROLES } from "@/constants/roles"
import {
  getAllowedAssistantDomains,
  getAssistantAccessPolicy,
} from "@/lib/assistant/policies"

describe("assistant access policies", () => {
  it("allows school admin on dashboard within the current school only", () => {
    const policy = getAssistantAccessPolicy({
      kind: "dashboard",
      user_id: "user-1",
      role: USER_ROLES.SCHOOL_ADMIN,
      tenant_id: "tenant-1",
      school_id: "school-1",
      full_name: "Admin User",
      display_name: null,
    })

    expect(policy.allowed).toBe(true)
    expect(policy.scopeDescription).toContain("المدرسة الحالية فقط")
  })

  it("keeps system admin restricted without an active school context", () => {
    const policy = getAssistantAccessPolicy({
      kind: "dashboard",
      user_id: "user-1",
      role: USER_ROLES.SYSTEM_ADMIN,
      tenant_id: "tenant-1",
      school_id: null,
      full_name: "System Admin",
      display_name: null,
    })

    expect(policy.allowed).toBe(false)
    expect(policy.denialDescription).toContain("عزل المدارس")
  })

  it("keeps teacher domains free of finance access", () => {
    expect(getAllowedAssistantDomains(USER_ROLES.TEACHER)).not.toContain(
      "finance"
    )
  })
})
