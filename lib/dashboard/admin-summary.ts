import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { buildAdminDashboardSummary } from "@/lib/dashboard/builders"
import {
  createListItem,
  formatCurrencyLabel,
  formatDateLabel,
  formatDateTimeLabel,
  getRelationCount,
  takeSingle,
} from "@/lib/dashboard/shared"
import { appRoutes } from "@/constants/routes"
import type { DashboardScope } from "@/types/dashboard"
import { ATTENDANCE_SESSION_METHOD_LABELS_AR } from "@/types/attendance"

export async function getAdminDashboardSummary(scope: DashboardScope) {
  const supabase = await createSupabaseServerClient()
  const nowIso = new Date().toISOString()
  const [
    activeStudentsResult,
    pendingAdmissionsResult,
    complaintsResult,
    unpaidInvoicesResult,
    attendanceResult,
    paymentsResult,
    announcementsResult,
    eventsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "active"),
    supabase
      .from("student_admissions")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "pending"),
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .in("status", ["submitted", "in_review"]),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .in("status", ["issued", "partially_paid"]),
    supabase
      .from("attendance_sessions")
      .select(
        "id, session_date, method, status, classes(name, section), attendance_records(count)"
      )
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("payments")
      .select(
        "id, amount, paid_at, receipt_number, students(full_name), invoices(invoice_number)"
      )
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .order("paid_at", { ascending: false })
      .limit(4),
    supabase
      .from("announcements")
      .select("id, title, published_at")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("school_events")
      .select("id, title, starts_at, location")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "scheduled")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(4),
  ])

  return buildAdminDashboardSummary(
    {
      activeStudentsCount: activeStudentsResult.count ?? 0,
      pendingAdmissionsCount: pendingAdmissionsResult.count ?? 0,
      openComplaintsCount: complaintsResult.count ?? 0,
      unpaidInvoicesCount: unpaidInvoicesResult.count ?? 0,
      recentAttendanceSessions:
        attendanceResult.data?.map((session) => {
          const classInfo = takeSingle(session.classes)

          return createListItem({
            id: session.id,
            title: classInfo
              ? `${classInfo.name} ${classInfo.section}`.trim()
              : "جلسة حضور",
            description: `${formatDateLabel(session.session_date)} · ${ATTENDANCE_SESSION_METHOD_LABELS_AR[session.method]}`,
            meta: `${getRelationCount(session.attendance_records)} سجل`,
            href: appRoutes.attendanceSessionDetails(session.id),
          })
        }) ?? [],
      recentPayments:
        paymentsResult.data?.map((payment) => {
          const student = takeSingle(payment.students)
          const invoice = takeSingle(payment.invoices)
          const amount = Number(payment.amount)

          return createListItem({
            id: payment.id,
            title: student?.full_name ?? payment.receipt_number,
            description: `${formatCurrencyLabel(amount)} · ${formatDateTimeLabel(payment.paid_at)}`,
            meta: invoice?.invoice_number ?? payment.receipt_number,
            href: appRoutes.financePaymentDetails(payment.id),
          })
        }) ?? [],
      recentAnnouncements:
        announcementsResult.data?.map((announcement) =>
          createListItem({
            id: announcement.id,
            title: announcement.title,
            description: `نشر في ${formatDateTimeLabel(announcement.published_at)}`,
            href: appRoutes.communicationAnnouncements,
          })
        ) ?? [],
      upcomingEvents:
        eventsResult.data?.map((event) =>
          createListItem({
            id: event.id,
            title: event.title,
            description: `${formatDateTimeLabel(event.starts_at)}${event.location ? ` · ${event.location}` : ""}`,
            href: appRoutes.communicationEvents,
          })
        ) ?? [],
    },
    scope.role === "system_admin" ? "system_admin" : "school_admin"
  )
}
