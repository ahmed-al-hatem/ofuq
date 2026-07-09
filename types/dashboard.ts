import type { UserRole } from "@/constants/roles"

export type StaffDashboardRole = Extract<
  UserRole,
  "system_admin" | "school_admin" | "teacher" | "accountant" | "librarian"
>

export type DashboardScope = {
  user_id: string
  role: StaffDashboardRole
  tenant_id: string
  school_id: string
}

export type DashboardQuickAction = {
  title: string
  description: string
  href: string
}

export type DashboardSummaryListItem = {
  id: string
  title: string
  description: string
  meta?: string
  href?: string
}

export type AdminDashboardSummary = {
  activeStudentsCount: number
  pendingAdmissionsCount: number
  openComplaintsCount: number
  unpaidInvoicesCount: number
  recentAttendanceSessions: DashboardSummaryListItem[]
  recentPayments: DashboardSummaryListItem[]
  recentAnnouncements: DashboardSummaryListItem[]
  upcomingEvents: DashboardSummaryListItem[]
  quickActions: DashboardQuickAction[]
}

export type TeacherDashboardSummary = {
  todayTimetableSlotsCount: number
  assignedSubjectsCount: number
  recentAttendanceSessions: DashboardSummaryListItem[]
  todayTimetableSlots: DashboardSummaryListItem[]
  recentExams: DashboardSummaryListItem[]
  recentAnnouncements: DashboardSummaryListItem[]
  quickActions: DashboardQuickAction[]
}

export type AccountantDashboardSummary = {
  invoicesCount: number
  paidInvoicesCount: number
  partialInvoicesCount: number
  unpaidInvoicesCount: number
  paymentsCount: number
  activeDiscountsCount: number
  outstandingBalance: number
  recentPayments: DashboardSummaryListItem[]
  quickActions: DashboardQuickAction[]
}

export type LibrarianDashboardSummary = {
  catalogCount: number
  copiesCount: number
  availableCopiesCount: number
  activeLoansCount: number
  overdueLoansCount: number
  recentLoans: DashboardSummaryListItem[]
  quickActions: DashboardQuickAction[]
}

export type RoleDashboardSummary =
  | {
      role: "system_admin" | "school_admin"
      data: AdminDashboardSummary
    }
  | {
      role: "teacher"
      data: TeacherDashboardSummary
    }
  | {
      role: "accountant"
      data: AccountantDashboardSummary
    }
  | {
      role: "librarian"
      data: LibrarianDashboardSummary
    }
