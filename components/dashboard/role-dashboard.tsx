import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { AccountantDashboard } from "@/components/dashboard/accountant-dashboard"
import { LibrarianDashboard } from "@/components/dashboard/librarian-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import type { RoleDashboardSummary } from "@/types/dashboard"

export function RoleDashboard({ summary }: { summary: RoleDashboardSummary }) {
  switch (summary.role) {
    case "system_admin":
    case "school_admin":
      return <AdminDashboard summary={summary.data} />
    case "teacher":
      return <TeacherDashboard summary={summary.data} />
    case "accountant":
      return <AccountantDashboard summary={summary.data} />
    case "librarian":
      return <LibrarianDashboard summary={summary.data} />
  }
}
