import { appRoutes } from "@/constants/routes"

describe("portal routes", () => {
  it("keeps the portal route set stable and non-empty", () => {
    expect(appRoutes.portal).toBe("/portal")
    expect(appRoutes.portalStudents).toBe("/portal/students")
    expect(appRoutes.portalAttendance).toBe("/portal/attendance")
    expect(appRoutes.portalGrades).toBe("/portal/grades")
    expect(appRoutes.portalTimetable).toBe("/portal/timetable")
    expect(appRoutes.portalFinance).toBe("/portal/finance")
    expect(appRoutes.portalLibrary).toBe("/portal/library")
    expect(appRoutes.portalAnnouncements).toBe("/portal/announcements")
    expect(appRoutes.portalProfile).toBe("/portal/profile")
  })

  it("keeps portal static routes unique and under /portal", () => {
    const routes = [
      appRoutes.portal,
      appRoutes.portalStudents,
      appRoutes.portalAttendance,
      appRoutes.portalGrades,
      appRoutes.portalTimetable,
      appRoutes.portalFinance,
      appRoutes.portalLibrary,
      appRoutes.portalAnnouncements,
      appRoutes.portalProfile,
    ]

    expect(routes.every((route) => route.startsWith("/portal"))).toBe(true)
    expect(new Set(routes).size).toBe(routes.length)
  })

  it("builds the portal student details route from a safe dummy id", () => {
    expect(appRoutes.portalStudentDetails("stu_123")).toBe(
      "/portal/students/stu_123"
    )
  })
})
