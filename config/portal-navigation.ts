import {
  Bell,
  Bot,
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  MessageSquareMore,
  UserRound,
  Users2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { appRoutes } from "@/constants/routes"

export type PortalNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type PortalNavigationGroup = {
  label: string
  items: PortalNavigationItem[]
}

export const portalNavigation: PortalNavigationGroup[] = [
  {
    label: "بوابة المتابعة",
    items: [
      {
        label: "الرئيسية",
        href: appRoutes.portal,
        icon: LayoutDashboard,
      },
      {
        label: "الأبناء / بياناتي",
        href: appRoutes.portalStudents,
        icon: Users2,
      },
      {
        label: "الحضور",
        href: appRoutes.portalAttendance,
        icon: CalendarCheck2,
      },
      {
        label: "الدرجات",
        href: appRoutes.portalGrades,
        icon: GraduationCap,
      },
      {
        label: "الجدول",
        href: appRoutes.portalTimetable,
        icon: CalendarDays,
      },
      {
        label: "المالية",
        href: appRoutes.portalFinance,
        icon: CircleDollarSign,
      },
      {
        label: "المكتبة",
        href: appRoutes.portalLibrary,
        icon: LibraryBig,
      },
      {
        label: "الإعلانات",
        href: appRoutes.portalAnnouncements,
        icon: Bell,
      },
      {
        label: "المراسلة",
        href: appRoutes.portalChat,
        icon: MessageSquareMore,
      },
      {
        label: "مساعد أُفُق",
        href: appRoutes.portalAssistant,
        icon: Bot,
      },
      {
        label: "الملف الشخصي",
        href: appRoutes.portalProfile,
        icon: UserRound,
      },
    ],
  },
] as const
