import Link from "next/link"
import {
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  ShieldAlert,
  Users2,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  requireReportsContext,
  writeReportAuditLog,
} from "@/lib/reports/context"

const reportRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
] as const

export default async function ReportsOverviewPage() {
  const contextResult = await requireReportsContext(reportRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="التقارير" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى التقارير"
          description={contextResult.error}
        />
      </div>
    )
  }

  await writeReportAuditLog(contextResult.data, "reports.overview")

  const cards = [
    {
      title: "تقرير الطلاب",
      description: "قائمة الطلاب مع الصف والشعبة وولي الأمر.",
      href: appRoutes.reportsStudents,
      icon: Users2,
    },
    {
      title: "تقرير الحضور",
      description: "ملخص حالات الحضور حسب الطالب.",
      href: appRoutes.reportsAttendance,
      icon: CalendarCheck2,
    },
    {
      title: "تقرير الدرجات",
      description: "ملخص نتائج الاختبارات ومدخلات الدرجات.",
      href: appRoutes.reportsGrades,
      icon: GraduationCap,
    },
    {
      title: "تقرير المالية",
      description: "أرصدة الفواتير والمدفوعات.",
      href: appRoutes.reportsFinance,
      icon: CircleDollarSign,
    },
    {
      title: "تقرير الجدول",
      description: "نظرة عامة على الحصص النشطة.",
      href: appRoutes.reportsTimetable,
      icon: CalendarDays,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التقارير"
        description="تقارير جاهزة للقراءة فقط. لا يوجد منشئ تقارير بالسحب والإفلات أو تصدير PDF في هذه المرحلة."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح التقرير
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
