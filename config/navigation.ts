import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  GraduationCap,
  HandHelping,
  LayoutDashboard,
  LibraryBig,
  MessageSquareMore,
  Settings2,
  ShieldCheck,
  HeartPulse,
  Users2,
  PlugZap,
  BookMarked,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { appRoutes } from "@/constants/routes"

export type NavigationItem = {
  label: string
  href?: string
  icon: LucideIcon
  placeholder?: boolean
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

export const dashboardNavigation: NavigationGroup[] = [
  {
    label: "التشغيل اليومي",
    items: [
      {
        label: "لوحة التحكم",
        href: appRoutes.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "الطلاب",
        icon: Users2,
        href: appRoutes.students,
      },
      {
        label: "القبول",
        icon: FileText,
        href: appRoutes.admissions,
      },
      {
        label: "الأكاديمي",
        icon: GraduationCap,
        href: appRoutes.academic,
      },
      {
        label: "الحضور",
        icon: CalendarCheck2,
        href: appRoutes.attendance,
      },
      {
        label: "الدرجات",
        icon: BookOpen,
        href: appRoutes.grades,
      },
      {
        label: "الجدول",
        icon: CalendarDays,
        href: appRoutes.timetable,
      },
      {
        label: "المالية",
        icon: CircleDollarSign,
        href: appRoutes.finance,
      },
      {
        label: "التواصل",
        icon: MessageSquareMore,
        href: appRoutes.communication,
      },
      {
        label: "الشكاوى والاستبيانات",
        icon: HandHelping,
        href: appRoutes.feedback,
      },
      {
        label: "التقارير",
        icon: BarChart3,
        href: appRoutes.reports,
      },
      {
        label: "المكتبة",
        icon: LibraryBig,
        href: appRoutes.library,
      },
    ],
  },
  {
    label: "إعدادات ومراحل لاحقة",
    items: [
      {
        label: "الرعاية الطلابية",
        icon: HeartPulse,
        href: appRoutes.studentCare,
      },
      {
        label: "الإعدادات",
        icon: Settings2,
        href: appRoutes.settings,
      },
      {
        label: "التكاملات",
        icon: PlugZap,
        href: appRoutes.integrations,
      },
      {
        label: "التقويم المدرسي",
        icon: BookMarked,
        placeholder: true,
      },
      {
        label: "الأمان",
        icon: ShieldCheck,
        placeholder: true,
      },
    ],
  },
] as const
