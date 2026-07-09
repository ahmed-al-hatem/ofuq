import { getDashboardQuickActionsForRole } from "@/lib/dashboard/quick-actions"
import type {
  AccountantDashboardSummary,
  AdminDashboardSummary,
  DashboardSummaryListItem,
  LibrarianDashboardSummary,
  StaffDashboardRole,
  TeacherDashboardSummary,
} from "@/types/dashboard"

type SummaryDefaults = {
  items?: DashboardSummaryListItem[]
}

function withItems(defaults?: SummaryDefaults): DashboardSummaryListItem[] {
  return defaults?.items ?? []
}

export function buildAdminDashboardSummary(
  input: Partial<AdminDashboardSummary> = {},
  role: Extract<StaffDashboardRole, "system_admin" | "school_admin"> = "school_admin"
): AdminDashboardSummary {
  return {
    activeStudentsCount: input.activeStudentsCount ?? 0,
    pendingAdmissionsCount: input.pendingAdmissionsCount ?? 0,
    openComplaintsCount: input.openComplaintsCount ?? 0,
    unpaidInvoicesCount: input.unpaidInvoicesCount ?? 0,
    recentAttendanceSessions: input.recentAttendanceSessions ?? withItems(),
    recentPayments: input.recentPayments ?? withItems(),
    recentAnnouncements: input.recentAnnouncements ?? withItems(),
    upcomingEvents: input.upcomingEvents ?? withItems(),
    quickActions: input.quickActions ?? getDashboardQuickActionsForRole(role),
  }
}

export function buildTeacherDashboardSummary(
  input: Partial<TeacherDashboardSummary> = {}
): TeacherDashboardSummary {
  return {
    todayTimetableSlotsCount: input.todayTimetableSlotsCount ?? 0,
    assignedSubjectsCount: input.assignedSubjectsCount ?? 0,
    recentAttendanceSessions: input.recentAttendanceSessions ?? withItems(),
    todayTimetableSlots: input.todayTimetableSlots ?? withItems(),
    recentExams: input.recentExams ?? withItems(),
    recentAnnouncements: input.recentAnnouncements ?? withItems(),
    quickActions:
      input.quickActions ?? getDashboardQuickActionsForRole("teacher"),
  }
}

export function buildAccountantDashboardSummary(
  input: Partial<AccountantDashboardSummary> = {}
): AccountantDashboardSummary {
  return {
    invoicesCount: input.invoicesCount ?? 0,
    paidInvoicesCount: input.paidInvoicesCount ?? 0,
    partialInvoicesCount: input.partialInvoicesCount ?? 0,
    unpaidInvoicesCount: input.unpaidInvoicesCount ?? 0,
    paymentsCount: input.paymentsCount ?? 0,
    activeDiscountsCount: input.activeDiscountsCount ?? 0,
    outstandingBalance: input.outstandingBalance ?? 0,
    recentPayments: input.recentPayments ?? withItems(),
    quickActions:
      input.quickActions ?? getDashboardQuickActionsForRole("accountant"),
  }
}

export function buildLibrarianDashboardSummary(
  input: Partial<LibrarianDashboardSummary> = {}
): LibrarianDashboardSummary {
  return {
    catalogCount: input.catalogCount ?? 0,
    copiesCount: input.copiesCount ?? 0,
    availableCopiesCount: input.availableCopiesCount ?? 0,
    activeLoansCount: input.activeLoansCount ?? 0,
    overdueLoansCount: input.overdueLoansCount ?? 0,
    recentLoans: input.recentLoans ?? withItems(),
    quickActions:
      input.quickActions ?? getDashboardQuickActionsForRole("librarian"),
  }
}
