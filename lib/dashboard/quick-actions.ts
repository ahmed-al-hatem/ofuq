import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import type { DashboardQuickAction, StaffDashboardRole } from "@/types/dashboard"

const adminQuickActions: DashboardQuickAction[] = [
  {
    title: "ملفات الطلاب",
    description: "مراجعة بيانات الطلاب الحالية والانتقال إلى السجلات الرسمية.",
    href: appRoutes.students,
  },
  {
    title: "طلبات القبول",
    description: "متابعة الطلبات الجديدة والحالات المعلقة داخل المدرسة.",
    href: appRoutes.admissions,
  },
  {
    title: "الحضور اليومي",
    description: "الوصول السريع إلى جلسات الحضور ومتابعة التنفيذ اليومي.",
    href: appRoutes.attendance,
  },
  {
    title: "المالية",
    description: "متابعة الفواتير والتحصيل والمدفوعات من مكان واحد.",
    href: appRoutes.finance,
  },
]

const teacherQuickActions: DashboardQuickAction[] = [
  {
    title: "تسجيل الحضور",
    description: "فتح قسم الحضور لتسجيل الجلسات ومراجعة آخر السجلات.",
    href: appRoutes.attendance,
  },
  {
    title: "إدخال الدرجات",
    description: "الانتقال مباشرة إلى مدخلات الدرجات والاختبارات القريبة.",
    href: appRoutes.gradeEntries,
  },
  {
    title: "الجدول",
    description: "مراجعة الحصص الحالية والتنقل إلى الجدول الدراسي.",
    href: appRoutes.timetable,
  },
  {
    title: "الرسائل",
    description: "متابعة الإعلانات والرسائل الداخلية المرتبطة بالعمل التعليمي.",
    href: appRoutes.communicationMessages,
  },
]

const accountantQuickActions: DashboardQuickAction[] = [
  {
    title: "الفواتير",
    description: "مراجعة الفواتير الحالية والحالات غير المحصلة.",
    href: appRoutes.financeInvoices,
  },
  {
    title: "المدفوعات",
    description: "متابعة السندات والمدفوعات المسجلة حديثًا.",
    href: appRoutes.financePayments,
  },
  {
    title: "الخصومات",
    description: "الوصول إلى أنواع الخصومات والحالات النشطة للطلاب.",
    href: appRoutes.financeDiscounts,
  },
  {
    title: "تقرير المالية",
    description: "عرض التقرير المالي الجاهز لمراجعة التحصيل والرصيد.",
    href: appRoutes.reportsFinance,
  },
]

const librarianQuickActions: DashboardQuickAction[] = [
  {
    title: "فهرس الكتب",
    description: "إدارة السجلات الأساسية للكتب والعناوين النشطة.",
    href: appRoutes.libraryCatalog,
  },
  {
    title: "نسخ الكتب",
    description: "متابعة النسخ المتاحة والحالة التشغيلية لكل نسخة.",
    href: appRoutes.libraryCopies,
  },
  {
    title: "الإعارات",
    description: "عرض الإعارات الحالية وسجل الحركة داخل المكتبة.",
    href: appRoutes.libraryLoans,
  },
  {
    title: "المتأخرات",
    description: "مراجعة الإعارات المتأخرة والحالات التي تحتاج متابعة.",
    href: appRoutes.libraryOverdue,
  },
]

export function getDashboardQuickActionsForRole(
  role: StaffDashboardRole
): DashboardQuickAction[] {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
    case USER_ROLES.SCHOOL_ADMIN:
      return adminQuickActions
    case USER_ROLES.TEACHER:
      return teacherQuickActions
    case USER_ROLES.ACCOUNTANT:
      return accountantQuickActions
    case USER_ROLES.LIBRARIAN:
      return librarianQuickActions
  }
}
