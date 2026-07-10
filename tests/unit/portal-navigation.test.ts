import { portalNavigation } from "@/config/portal-navigation"
import { appRoutes } from "@/constants/routes"

describe("portalNavigation", () => {
  const allItems = portalNavigation.flatMap((group) => group.items)

  it("uses non-empty Arabic labels and hrefs", () => {
    for (const item of allItems) {
      expect(item.label.trim().length).toBeGreaterThan(0)
      expect(item.href.trim().startsWith("/")).toBe(true)
    }
  })

  it("does not duplicate active hrefs", () => {
    const hrefs = allItems.map((item) => item.href)

    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it("matches the implemented portal routes", () => {
    expect(new Set(allItems.map((item) => item.href))).toEqual(
      new Set([
        appRoutes.portal,
        appRoutes.portalStudents,
        appRoutes.portalAttendance,
        appRoutes.portalGrades,
        appRoutes.portalTimetable,
        appRoutes.portalFinance,
        appRoutes.portalLibrary,
        appRoutes.portalAnnouncements,
        appRoutes.portalChat,
        appRoutes.portalAssistant,
        appRoutes.portalProfile,
      ])
    )
  })
})
