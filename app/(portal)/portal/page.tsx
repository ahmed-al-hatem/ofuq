import Link from "next/link"
import {
  Bell,
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  ShieldAlert,
  Users2,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import { getPortalFinanceSummary } from "@/lib/portal/finance"
import { listPortalAnnouncements } from "@/lib/portal/announcements"
import { requirePortalContext } from "@/lib/portal/context"
import { listPortalAttendanceRecords } from "@/lib/portal/attendance"
import { listPortalGrades } from "@/lib/portal/grades"

export default async function PortalHomePage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="البوابة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى البوابة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const context = contextResult.data
  const [attendanceRecords, grades, finance, announcements] = await Promise.all([
    listPortalAttendanceRecords(context),
    listPortalGrades(context),
    getPortalFinanceSummary(context),
    listPortalAnnouncements(context),
  ])

  const financeValue = finance.canViewDetails
    ? finance.invoices.length.toString()
    : "خاص بولي الأمر"

  const cards = [
    {
      title: context.role === "parent" ? "الأبناء" : "بياناتي",
      value: context.linked_students.length.toString(),
      description: "الطلاب المرتبطون بهذا الحساب ضمن المدرسة الحالية.",
      href: appRoutes.portalStudents,
      icon: Users2,
    },
    {
      title: "الحضور",
      value: attendanceRecords.length.toString(),
      description: "سجل الحضور المعروض للقراءة فقط.",
      href: appRoutes.portalAttendance,
      icon: CalendarCheck2,
    },
    {
      title: "الدرجات",
      value: (
        grades.examResults.length +
        grades.gradeEntries.length +
        grades.reportCards.length
      ).toString(),
      description: "نتائج الاختبارات ومدخلات الدرجات وبطاقات التقييم.",
      href: appRoutes.portalGrades,
      icon: GraduationCap,
    },
    {
      title: "الجدول",
      value: "عرض",
      description: "الحصص النشطة للشعب المرتبطة بالطلاب المسموح بعرضهم.",
      href: appRoutes.portalTimetable,
      icon: CalendarDays,
    },
    {
      title: "المالية",
      value: financeValue,
      description:
        "الفواتير والمدفوعات والخصومات متاحة لولي الأمر فقط في هذه المرحلة.",
      href: appRoutes.portalFinance,
      icon: CircleDollarSign,
    },
    {
      title: "الإعلانات",
      value: (
        announcements.announcements.length + announcements.events.length
      ).toString(),
      description: "إعلانات المدرسة والفعاليات المناسبة لسياق الطالب.",
      href: appRoutes.portalAnnouncements,
      icon: Bell,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="بوابة المتابعة"
        description="منطقة آمنة للقراءة فقط تعرض البيانات المسموح بها حسب العضوية الحالية والارتباط الفعلي بالطالب."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-3xl">{card.value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح القسم
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {context.linked_students.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="لا توجد روابط طلاب لهذا الحساب"
          description="تم تسجيل الدخول بنجاح، لكن لا يوجد طالب مرتبط بهذا الحساب داخل المدرسة الحالية حتى الآن."
        />
      ) : null}
    </div>
  )
}
