import { appRoutes } from "@/constants/routes"

describe("appRoutes", () => {
  it("keeps core dashboard module routes stable and non-empty", () => {
    expect(appRoutes.dashboard).toBe("/dashboard")
    expect(appRoutes.students).toBe("/dashboard/students")
    expect(appRoutes.academic).toBe("/dashboard/academic")
    expect(appRoutes.attendance).toBe("/dashboard/attendance")
    expect(appRoutes.grades).toBe("/dashboard/grades")
    expect(appRoutes.timetable).toBe("/dashboard/timetable")
    expect(appRoutes.finance).toBe("/dashboard/finance")
    expect(appRoutes.communication).toBe("/dashboard/communication")
    expect(appRoutes.reports).toBe("/dashboard/reports")
    expect(appRoutes.library).toBe("/dashboard/library")
    expect(appRoutes.studentCare).toBe("/dashboard/student-care")
    expect(appRoutes.feedback).toBe("/dashboard/feedback")
  })

  it("keeps important static routes non-empty", () => {
    const routes = [
      appRoutes.dashboard,
      appRoutes.students,
      appRoutes.academic,
      appRoutes.attendance,
      appRoutes.grades,
      appRoutes.timetable,
      appRoutes.finance,
      appRoutes.communication,
      appRoutes.reports,
      appRoutes.library,
      appRoutes.studentCare,
      appRoutes.feedback,
    ]

    expect(routes.every((route) => route.startsWith("/dashboard"))).toBe(true)
    expect(new Set(routes).size).toBe(routes.length)
  })

  it("builds dynamic detail routes from safe dummy ids", () => {
    expect(appRoutes.admissionDetails("adm_123")).toBe(
      "/dashboard/admissions/adm_123"
    )
    expect(appRoutes.studentDetails("stu_123")).toBe("/dashboard/students/stu_123")
    expect(appRoutes.attendanceSessionDetails("session_123")).toBe(
      "/dashboard/attendance/sessions/session_123"
    )
    expect(appRoutes.gradesExamDetails("exam_123")).toBe(
      "/dashboard/grades/exams/exam_123"
    )
    expect(appRoutes.financeInvoiceDetails("invoice_123")).toBe(
      "/dashboard/finance/invoices/invoice_123"
    )
    expect(appRoutes.feedbackSurveyRespond("survey_123")).toBe(
      "/dashboard/feedback/surveys/survey_123/respond"
    )
    expect(appRoutes.libraryLoanDetails("loan_123")).toBe(
      "/dashboard/library/loans/loan_123"
    )
  })
})
