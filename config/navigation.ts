import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  GraduationCap,
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
        placeholder: true,
      },
      {
        label: "التقارير",
        icon: BarChart3,
        placeholder: true,
      },
    ],
  },
  {
    label: "إعدادات ومراحل لاحقة",
    items: [
      {
        label: "المكتبة",
        icon: LibraryBig,
        placeholder: true,
      },
      {
        label: "الصحة",
        icon: HeartPulse,
        placeholder: true,
      },
      {
        label: "الإعدادات",
        icon: Settings2,
        placeholder: true,
      },
      {
        label: "التكاملات",
        icon: PlugZap,
        placeholder: true,
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
