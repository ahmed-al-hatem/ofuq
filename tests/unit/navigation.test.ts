import { dashboardNavigation } from "@/config/navigation"
import { appRoutes } from "@/constants/routes"

describe("dashboardNavigation", () => {
  const allItems = dashboardNavigation.flatMap((group) => group.items)
  const activeItems = allItems.filter((item) => item.href)
  const placeholderItems = allItems.filter((item) => item.placeholder)

  it("uses non-empty Arabic labels and hrefs for active entries", () => {
    for (const item of activeItems) {
      expect(item.label.trim().length).toBeGreaterThan(0)
      expect(item.href).toBeTruthy()
      expect(item.href?.trim().startsWith("/")).toBe(true)
    }
  })

  it("does not duplicate active hrefs", () => {
    const hrefs = activeItems.map((item) => item.href)

    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it("represents the implemented dashboard modules", () => {
    const hrefs = new Set(activeItems.map((item) => item.href))

    expect(hrefs).toEqual(
      new Set([
        appRoutes.dashboard,
        appRoutes.students,
        appRoutes.admissions,
        appRoutes.academic,
        appRoutes.attendance,
        appRoutes.grades,
        appRoutes.timetable,
        appRoutes.finance,
        appRoutes.communication,
        appRoutes.feedback,
        appRoutes.reports,
        appRoutes.library,
        appRoutes.studentCare,
      ])
    )
  })

  it("keeps future placeholders inactive until implemented", () => {
    expect(placeholderItems.length).toBeGreaterThan(0)

    for (const item of placeholderItems) {
      expect(item.href).toBeUndefined()
      expect(item.placeholder).toBe(true)
    }
  })
})
