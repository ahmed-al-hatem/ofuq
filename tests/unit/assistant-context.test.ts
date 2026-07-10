import { describe, expect, it } from "vitest"

import { USER_ROLES } from "@/constants/roles"
import { getGeminiRuntimeConfig, getGeminiRuntimeStatus } from "@/lib/assistant/gemini-client"
import {
  getPortalStudentAudienceLines,
} from "@/lib/assistant/policies"

describe("assistant context helpers", () => {
  it("shows all linked children for parent scope", () => {
    const lines = getPortalStudentAudienceLines(
      USER_ROLES.PARENT,
      [
        { id: "student-1", full_name: "أحمد حسن", student_number: "S-1", status: "active" },
        { id: "student-2", full_name: "ليان حسن", student_number: "S-2", status: "active" },
      ]
    )

    expect(lines).toEqual(["أحمد حسن", "ليان حسن"])
  })

  it("keeps student scope limited to self only", () => {
    const lines = getPortalStudentAudienceLines(
      USER_ROLES.STUDENT,
      [
        { id: "student-1", full_name: "أحمد حسن", student_number: "S-1", status: "active" },
        { id: "student-2", full_name: "ليان حسن", student_number: "S-2", status: "active" },
      ],
      "student-2"
    )

    expect(lines).toEqual(["ليان حسن"])
  })

  it("reports setup_required when the Gemini key is missing", () => {
    const previousValue = process.env.GEMINI_API_KEY

    delete process.env.GEMINI_API_KEY

    expect(getGeminiRuntimeConfig().apiKey).toBeNull()
    expect(getGeminiRuntimeStatus()).toEqual({
      status: "setup_required",
      setupMessage:
        "مساعد أُفُق غير مفعّل بعد. يرجى ضبط GEMINI_API_KEY في بيئة التشغيل.",
    })

    if (previousValue) {
      process.env.GEMINI_API_KEY = previousValue
    }
  })
})
