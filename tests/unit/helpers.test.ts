import { requireSchoolContext, requireTenant } from "@/lib/actions/require-tenant"
import {
  formatSurveyAnswerValue,
  parseSurveyChoiceOptions,
  parseSurveyRatingOptions,
} from "@/types/feedback"
import { nonEmptyStringSchema, uuidSchema } from "@/lib/validation/common"

describe("pure helpers and validation", () => {
  it("normalizes survey choice options", () => {
    expect(
      parseSurveyChoiceOptions([" نعم ", "لا", 3, "", null] as never)
    ).toEqual(["نعم", "لا"])
    expect(parseSurveyChoiceOptions(null)).toEqual([])
  })

  it("falls back to safe survey rating defaults when options are invalid", () => {
    expect(parseSurveyRatingOptions({ min: 1, max: 10, step: 2 })).toEqual({
      min: 1,
      max: 10,
      step: 2,
    })

    expect(parseSurveyRatingOptions({ min: 5, max: 2, step: 1 })).toEqual({
      min: 1,
      max: 5,
      step: 1,
    })
  })

  it("formats survey answers in Arabic-friendly output", () => {
    expect(formatSurveyAnswerValue(null)).toBe("بدون إجابة")
    expect(formatSurveyAnswerValue(["الخيار الأول", "الخيار الثاني"])).toBe(
      "الخيار الأول، الخيار الثاني"
    )
    expect(formatSurveyAnswerValue(true)).toBe("نعم")
  })

  it("requires tenant and school context without trusting field casing", () => {
    expect(
      requireTenant({
        tenantId: "tenant-1" as never,
        school_id: "school-1" as never,
      })
    ).toEqual({
      ok: true,
      data: {
        tenant_id: "tenant-1",
        school_id: "school-1",
      },
    })

    expect(requireSchoolContext({ tenant_id: "tenant-1" as never })).toEqual({
      ok: false,
      error: "سياق المدرسة غير متوفر لهذا الإجراء",
    })
  })

  it("keeps shared validation schemas strict for required strings and uuids", () => {
    expect(uuidSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(
      true
    )
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false)
    expect(nonEmptyStringSchema.safeParse("  ").success).toBe(false)
    expect(nonEmptyStringSchema.safeParse("الاسم").success).toBe(true)
  })
})
