import { render, screen } from "@testing-library/react"

import { RoleDashboard } from "@/components/dashboard/role-dashboard"
import {
  buildAccountantDashboardSummary,
  buildTeacherDashboardSummary,
} from "@/lib/dashboard/builders"

describe("role dashboard", () => {
  it("renders the teacher dashboard content for the teacher role", () => {
    render(
      <RoleDashboard
        summary={{
          role: "teacher",
          data: buildTeacherDashboardSummary({
            todayTimetableSlotsCount: 2,
          }),
        }}
      />
    )

    expect(screen.getByRole("heading", { name: "لوحة المعلم" })).toBeInTheDocument()
    expect(screen.getByText("إدخال الدرجات")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "لوحة المحاسب" })).not.toBeInTheDocument()
  })

  it("renders the accountant dashboard content for the accountant role", () => {
    render(
      <RoleDashboard
        summary={{
          role: "accountant",
          data: buildAccountantDashboardSummary({
            invoicesCount: 7,
          }),
        }}
      />
    )

    expect(screen.getByRole("heading", { name: "لوحة المحاسب" })).toBeInTheDocument()
    expect(screen.getByText("الفواتير")).toBeInTheDocument()
    expect(screen.queryByText("الإعارات")).not.toBeInTheDocument()
  })
})
