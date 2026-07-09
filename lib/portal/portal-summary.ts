import { appRoutes } from "@/constants/routes"
import { listPortalAnnouncements } from "@/lib/portal/announcements"
import { listPortalAttendanceRecords } from "@/lib/portal/attendance"
import { getPortalFinanceSummary } from "@/lib/portal/finance"
import { listPortalGrades } from "@/lib/portal/grades"
import { listPortalLibraryLoans } from "@/lib/portal/library"
import {
  buildParentPortalOverviewSummary,
  buildStudentPortalOverviewSummary,
} from "@/lib/portal/portal-summary-builders"
import { listPortalTimetableSlots } from "@/lib/portal/timetable"
import { ATTENDANCE_STATUS_LABELS_AR } from "@/types/attendance"
import { BOOK_LOAN_STATUS_LABELS_AR } from "@/types/library"
import type {
  PortalContext,
  PortalOverviewSectionItem,
  PortalOverviewSummary,
} from "@/types/portal"
import { TIMETABLE_DAY_LABELS_AR } from "@/types/timetable"

function formatPortalMoney(value: number) {
  return new Intl.NumberFormat("ar-SY", {
    style: "currency",
    currency: "SYP",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "بدون تاريخ"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "بدون موعد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function buildLatestGradeHighlights(input: {
  examResults: Awaited<ReturnType<typeof listPortalGrades>>["examResults"]
  gradeEntries: Awaited<ReturnType<typeof listPortalGrades>>["gradeEntries"]
  reportCards: Awaited<ReturnType<typeof listPortalGrades>>["reportCards"]
}): PortalOverviewSectionItem[] {
  return [
    ...input.examResults.map((item) => ({
      id: `exam-${item.id}`,
      sortKey: item.entered_at,
      value: {
        id: `exam-${item.id}`,
        title: item.exam_title,
        description: `${item.subject_name} · ${item.student_name}`,
        meta:
          item.score === null
            ? "النتيجة غير مكتملة"
            : `${item.score}/${item.max_score}`,
        href: appRoutes.portalGrades,
      },
    })),
    ...input.gradeEntries.map((item) => ({
      id: `grade-${item.id}`,
      sortKey: item.recorded_on,
      value: {
        id: `grade-${item.id}`,
        title: item.title,
        description: `${item.subject_name} · ${item.student_name}`,
        meta: `${item.score}/${item.max_score}`,
        href: appRoutes.portalGrades,
      },
    })),
    ...input.reportCards.map((item) => ({
      id: `report-${item.id}`,
      sortKey: item.generated_at,
      value: {
        id: `report-${item.id}`,
        title: `بطاقة تقييم ${item.student_name}`,
        description: `${item.academic_year_name ?? "عام دراسي"}${item.term_name ? ` · ${item.term_name}` : ""}`,
        meta: item.published_at ? `نُشرت ${formatDate(item.published_at)}` : "قيد المراجعة",
        href: appRoutes.portalGrades,
      },
    })),
  ]
    .sort((left, right) => right.sortKey.localeCompare(left.sortKey))
    .slice(0, 4)
    .map((item) => item.value)
}

function buildAnnouncementHighlights(
  announcements: Awaited<ReturnType<typeof listPortalAnnouncements>>
): PortalOverviewSectionItem[] {
  return [
    ...announcements.announcements.map((item) => ({
      id: `announcement-${item.id}`,
      sortKey: item.published_at ?? "",
      value: {
        id: `announcement-${item.id}`,
        title: item.title,
        description: item.body,
        meta: item.published_at ? formatDateTime(item.published_at) : undefined,
        href: appRoutes.portalAnnouncements,
      },
    })),
    ...announcements.events.map((item) => ({
      id: `event-${item.id}`,
      sortKey: item.starts_at,
      value: {
        id: `event-${item.id}`,
        title: item.title,
        description: item.description ?? "فعالية مدرسية",
        meta: formatDateTime(item.starts_at),
        href: appRoutes.portalAnnouncements,
      },
    })),
  ]
    .sort((left, right) => right.sortKey.localeCompare(left.sortKey))
    .slice(0, 4)
    .map((item) => item.value)
}

export async function getPortalOverviewSummary(
  context: PortalContext
): Promise<PortalOverviewSummary> {
  const [attendance, grades, finance, timetable, libraryLoans, announcements] =
    await Promise.all([
      listPortalAttendanceRecords(context),
      listPortalGrades(context),
      getPortalFinanceSummary(context),
      listPortalTimetableSlots(context),
      listPortalLibraryLoans(context),
      listPortalAnnouncements(context),
    ])

  const attendanceHighlights = attendance.slice(0, 4).map((record) => ({
    id: record.id,
    title: record.student_name,
    description: `${ATTENDANCE_STATUS_LABELS_AR[record.status]} · ${formatDate(record.session_date ?? record.recorded_at)}`,
    meta: record.class_name
      ? `${record.class_name}${record.class_section ? ` ${record.class_section}` : ""}`
      : undefined,
    href: appRoutes.portalAttendance,
  }))
  const latestGrades = buildLatestGradeHighlights(grades)
  const upcomingTimetable = timetable.slice(0, 4).map((slot) => ({
    id: slot.id,
    title: slot.subject_name,
    description: `${TIMETABLE_DAY_LABELS_AR[slot.day_of_week]} · ${slot.starts_at} - ${slot.ends_at}`,
    meta: `${slot.class_name}${slot.class_section ? ` ${slot.class_section}` : ""}`,
    href: appRoutes.portalTimetable,
  }))
  const recentAnnouncements = buildAnnouncementHighlights(announcements)

  if (context.role === "parent") {
    const outstandingBalance = finance.invoices.reduce(
      (sum, invoice) => sum + invoice.balance_amount,
      0
    )

    return buildParentPortalOverviewSummary({
      linkedChildren: context.linked_students.map((student) => ({
        id: student.id,
        title: student.full_name,
        description: `الرقم الطلابي ${student.student_number}`,
        meta: student.status,
        href: appRoutes.portalStudentDetails(student.id),
      })),
      attendanceHighlights,
      latestGrades,
      financeHighlights: finance.invoices.slice(0, 4).map((invoice) => ({
        id: invoice.id,
        title: invoice.student_name,
        description: `${invoice.invoice_number} · ${formatPortalMoney(invoice.balance_amount)}`,
        meta: invoice.due_date ? `الاستحقاق ${formatDate(invoice.due_date)}` : invoice.status,
        href: appRoutes.portalFinance,
      })),
      upcomingTimetable,
      recentAnnouncements,
      linkedChildrenCount: context.linked_students.length,
      attendanceCount: attendance.length,
      unpaidInvoicesCount: finance.invoices.filter(
        (invoice) => invoice.balance_amount > 0
      ).length,
      outstandingBalance,
      recentAnnouncementsCount:
        announcements.announcements.length + announcements.events.length,
    })
  }

  return buildStudentPortalOverviewSummary({
    attendanceHighlights,
    latestGrades,
    libraryHighlights: libraryLoans.slice(0, 4).map((loan) => ({
      id: loan.id,
      title: loan.book_title,
      description: `${BOOK_LOAN_STATUS_LABELS_AR[loan.status]} · ${formatDateTime(loan.borrowed_at)}`,
      meta: `الاستحقاق ${formatDateTime(loan.due_at)}`,
      href: appRoutes.portalLibrary,
    })),
    upcomingTimetable,
    recentAnnouncements,
    timetableCount: timetable.length,
    gradesCount:
      grades.examResults.length +
      grades.gradeEntries.length +
      grades.reportCards.length,
    attendanceCount: attendance.length,
    activeLoansCount: libraryLoans.filter((loan) => loan.status === "active").length,
  })
}
