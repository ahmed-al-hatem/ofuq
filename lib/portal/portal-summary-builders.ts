import { appRoutes } from "@/constants/routes"
import type {
  ParentPortalOverviewSummary,
  PortalOverviewSectionItem,
  StudentPortalOverviewSummary,
} from "@/types/portal"

function formatMoney(value: number) {
  return new Intl.NumberFormat("ar-SY", {
    style: "currency",
    currency: "SYP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function buildParentPortalOverviewSummary(input: {
  linkedChildren: PortalOverviewSectionItem[]
  attendanceHighlights: PortalOverviewSectionItem[]
  latestGrades: PortalOverviewSectionItem[]
  financeHighlights: PortalOverviewSectionItem[]
  upcomingTimetable: PortalOverviewSectionItem[]
  recentAnnouncements: PortalOverviewSectionItem[]
  linkedChildrenCount: number
  attendanceCount: number
  unpaidInvoicesCount: number
  outstandingBalance: number
  recentAnnouncementsCount: number
}): ParentPortalOverviewSummary {
  return {
    role: "parent",
    title: "بوابة المتابعة",
    description:
      "ملخص يومي لمتابعة الأبناء والحضور والدرجات والفواتير ضمن المدرسة الحالية.",
    stats: [
      {
        title: "الأبناء المرتبطون",
        value: input.linkedChildrenCount,
        description: "عدد الطلاب المرتبطين بهذا الحساب.",
        href: appRoutes.portalStudents,
      },
      {
        title: "سجلات الحضور",
        value: input.attendanceCount,
        description: "آخر السجلات المقروءة ضمن صلاحية البوابة.",
        href: appRoutes.portalAttendance,
      },
      {
        title: "الفواتير غير المحصلة",
        value: input.unpaidInvoicesCount,
        description: `الرصيد القائم ${formatMoney(input.outstandingBalance)}`,
        href: appRoutes.portalFinance,
      },
      {
        title: "الإعلانات الأخيرة",
        value: input.recentAnnouncementsCount,
        description: "آخر الإعلانات والفعاليات المناسبة للأبناء.",
        href: appRoutes.portalAnnouncements,
      },
    ],
    linkedChildren: input.linkedChildren,
    attendanceHighlights: input.attendanceHighlights,
    latestGrades: input.latestGrades,
    financeHighlights: input.financeHighlights,
    upcomingTimetable: input.upcomingTimetable,
    recentAnnouncements: input.recentAnnouncements,
  }
}

export function buildStudentPortalOverviewSummary(input: {
  attendanceHighlights: PortalOverviewSectionItem[]
  latestGrades: PortalOverviewSectionItem[]
  libraryHighlights: PortalOverviewSectionItem[]
  upcomingTimetable: PortalOverviewSectionItem[]
  recentAnnouncements: PortalOverviewSectionItem[]
  timetableCount: number
  gradesCount: number
  attendanceCount: number
  activeLoansCount: number
}): StudentPortalOverviewSummary {
  return {
    role: "student",
    title: "بوابة المتابعة",
    description:
      "ملخص شخصي لجدولك القريب وآخر الدرجات والحضور والكتب المستعارة.",
    stats: [
      {
        title: "جدولي القريب",
        value: input.timetableCount,
        description: "عدد الحصص المعروضة ضمن الجدول الحالي.",
        href: appRoutes.portalTimetable,
      },
      {
        title: "آخر الدرجات",
        value: input.gradesCount,
        description: "أحدث النتائج والبطاقات التعليمية المعروضة لك.",
        href: appRoutes.portalGrades,
      },
      {
        title: "حالة الحضور",
        value: input.attendanceCount,
        description: "سجلات الحضور المعروضة لك للقراءة فقط.",
        href: appRoutes.portalAttendance,
      },
      {
        title: "كتبي المستعارة",
        value: input.activeLoansCount,
        description: "الإعارات النشطة أو القريبة من الاستحقاق.",
        href: appRoutes.portalLibrary,
      },
    ],
    attendanceHighlights: input.attendanceHighlights,
    latestGrades: input.latestGrades,
    libraryHighlights: input.libraryHighlights,
    upcomingTimetable: input.upcomingTimetable,
    recentAnnouncements: input.recentAnnouncements,
  }
}
