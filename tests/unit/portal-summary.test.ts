import { appRoutes } from "@/constants/routes"
import {
  buildParentPortalOverviewSummary,
  buildStudentPortalOverviewSummary,
} from "@/lib/portal/portal-summary-builders"

describe("portal summary", () => {
  it("builds a parent overview with linked children and finance highlights", () => {
    const summary = buildParentPortalOverviewSummary({
      linkedChildren: [
        {
          id: "student-1",
          title: "أحمد",
          description: "الرقم الطلابي 1001",
          href: appRoutes.portalStudentDetails("student-1"),
        },
      ],
      attendanceHighlights: [],
      latestGrades: [],
      financeHighlights: [
        {
          id: "invoice-1",
          title: "فاتورة أحمد",
          description: "قيد المتابعة",
          href: appRoutes.portalFinance,
        },
      ],
      upcomingTimetable: [],
      recentAnnouncements: [],
      linkedChildrenCount: 1,
      attendanceCount: 3,
      unpaidInvoicesCount: 1,
      outstandingBalance: 1000,
      recentAnnouncementsCount: 2,
    })

    expect(summary.role).toBe("parent")
    expect(summary.linkedChildren[0]?.href).toBe(
      appRoutes.portalStudentDetails("student-1")
    )
    expect(summary.financeHighlights[0]?.href).toBe(appRoutes.portalFinance)
    expect("libraryHighlights" in summary).toBe(false)
  })

  it("builds a student overview with library highlights and no finance section", () => {
    const summary = buildStudentPortalOverviewSummary({
      attendanceHighlights: [],
      latestGrades: [],
      libraryHighlights: [
        {
          id: "loan-1",
          title: "اللغة العربية",
          description: "إعارة نشطة",
          href: appRoutes.portalLibrary,
        },
      ],
      upcomingTimetable: [],
      recentAnnouncements: [],
      timetableCount: 4,
      gradesCount: 5,
      attendanceCount: 6,
      activeLoansCount: 1,
    })

    expect(summary.role).toBe("student")
    expect(summary.libraryHighlights[0]?.href).toBe(appRoutes.portalLibrary)
    expect(summary.description).toContain("جدولك")
    expect("financeHighlights" in summary).toBe(false)
  })
})
