import "server-only"

import { TIMETABLE_DAY_LABELS_AR } from "@/types/timetable"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { buildTeacherDashboardSummary } from "@/lib/dashboard/builders"
import {
  createListItem,
  formatDateLabel,
  formatDateTimeLabel,
  getRelationCount,
  getTodayTimetableDay,
  takeSingle,
} from "@/lib/dashboard/shared"
import { appRoutes } from "@/constants/routes"
import type { DashboardScope } from "@/types/dashboard"
import { ATTENDANCE_SESSION_METHOD_LABELS_AR } from "@/types/attendance"

export async function getTeacherDashboardSummary(scope: DashboardScope) {
  const supabase = await createSupabaseServerClient()
  const todayDay = getTodayTimetableDay()
  const [
    assignedSubjectsResult,
    timetableCountResult,
    timetableSlotsResult,
    attendanceResult,
    examsResult,
    announcementsResult,
  ] = await Promise.all([
    supabase
      .from("teacher_subject_assignments")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("teacher_user_id", scope.user_id)
      .eq("status", "active"),
    supabase
      .from("timetable_slots")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("teacher_user_id", scope.user_id)
      .eq("status", "active")
      .eq("day_of_week", todayDay),
    supabase
      .from("timetable_slots")
      .select("id, day_of_week, starts_at, ends_at, classes(name, section), subjects(name)")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("teacher_user_id", scope.user_id)
      .eq("status", "active")
      .eq("day_of_week", todayDay)
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("attendance_sessions")
      .select("id, session_date, method, classes(name, section), attendance_records(count)")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("taken_by_user_id", scope.user_id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("exams")
      .select("id, title, exam_date, classes(name, section), subjects(name)")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("created_by_user_id", scope.user_id)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("announcements")
      .select("id, title, published_at")
      .eq("tenant_id", scope.tenant_id)
      .eq("school_id", scope.school_id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
  ])

  return buildTeacherDashboardSummary({
    todayTimetableSlotsCount: timetableCountResult.count ?? 0,
    assignedSubjectsCount: assignedSubjectsResult.count ?? 0,
    todayTimetableSlots:
      timetableSlotsResult.data?.map((slot) => {
        const classInfo = takeSingle(slot.classes)
        const subject = takeSingle(slot.subjects)

        return createListItem({
          id: slot.id,
          title: subject?.name ?? "حصة دراسية",
          description: `${TIMETABLE_DAY_LABELS_AR[slot.day_of_week]} · ${slot.starts_at} - ${slot.ends_at}`,
          meta: classInfo ? `${classInfo.name} ${classInfo.section}`.trim() : undefined,
          href: appRoutes.timetableSlots,
        })
      }) ?? [],
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
    recentExams:
      examsResult.data?.map((exam) => {
        const classInfo = takeSingle(exam.classes)
        const subject = takeSingle(exam.subjects)

        return createListItem({
          id: exam.id,
          title: exam.title,
          description: `${subject?.name ?? "مادة"}${classInfo ? ` · ${classInfo.name} ${classInfo.section}` : ""}`,
          meta: formatDateLabel(exam.exam_date),
          href: appRoutes.gradesExamDetails(exam.id),
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
  })
}
