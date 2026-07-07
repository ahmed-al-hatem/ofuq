import Link from "next/link"
import {
  Award,
  HeartPulse,
  ShieldAlert,
  ShieldMinus,
  Stethoscope,
  Syringe,
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
import { countPublishedAchievements } from "@/lib/student-care/achievements"
import { countOpenClinicVisits } from "@/lib/student-care/clinic-visits"
import { countOpenDisciplineRecords } from "@/lib/student-care/discipline"
import { countActiveHealthRecords } from "@/lib/student-care/health-records"
import { requireStudentCareContext } from "@/lib/student-care/context"
import { countVaccinations } from "@/lib/student-care/vaccinations"

const studentCareReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function canManageSensitiveStudentCare(role: string) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.SCHOOL_ADMIN
  )
}

function canManageTeacherStudentCare(role: string) {
  return canManageSensitiveStudentCare(role) || role === USER_ROLES.TEACHER
}

export default async function StudentCareOverviewPage() {
  const contextResult = await requireStudentCareContext(studentCareReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الرعاية الطلابية"
          description="الصحة المدرسية الأساسية، زيارات العيادة، الانضباط، والإنجازات."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى وحدة الرعاية الطلابية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canManageSensitive = canManageSensitiveStudentCare(contextResult.data.role)
  const canManageTeacherScope = canManageTeacherStudentCare(contextResult.data.role)
  const [healthRecordsCount, vaccinationsCount, openClinicVisitsCount, openDisciplineCount, publishedAchievementsCount] =
    await Promise.all([
      canManageSensitive ? countActiveHealthRecords(contextResult.data) : Promise.resolve(null),
      canManageSensitive ? countVaccinations(contextResult.data) : Promise.resolve(null),
      canManageSensitive ? countOpenClinicVisits(contextResult.data) : Promise.resolve(null),
      countOpenDisciplineRecords(contextResult.data, {
        actorOnly: !canManageSensitive,
      }),
      countPublishedAchievements(contextResult.data, {
        actorOnly: !canManageSensitive,
      }),
    ])

  const cards = [
    {
      title: "السجلات الصحية",
      value: canManageSensitive ? healthRecordsCount ?? 0 : "مقيد",
      description: "ملف صحي مدرسي مختصر لكل طالب",
      href: canManageSensitive ? appRoutes.studentCareHealth : undefined,
      icon: HeartPulse,
    },
    {
      title: "التطعيمات",
      value: canManageSensitive ? vaccinationsCount ?? 0 : "مقيد",
      description: "متابعة جرعات وتواريخ قادمة دون تنبيهات خارجية",
      href: canManageSensitive ? appRoutes.studentCareVaccinations : undefined,
      icon: Syringe,
    },
    {
      title: "زيارات العيادة",
      value: canManageSensitive ? openClinicVisitsCount ?? 0 : "مقيد",
      description: "زيارات مفتوحة تتطلب إغلاقًا أو إحالة",
      href: canManageSensitive ? appRoutes.studentCareClinicVisits : undefined,
      icon: Stethoscope,
    },
    {
      title: "سجلات الانضباط",
      value: openDisciplineCount,
      description: "حالات غير مغلقة ضمن نطاق صلاحيتك الحالية",
      href: canManageTeacherScope ? appRoutes.studentCareDiscipline : undefined,
      icon: ShieldMinus,
    },
    {
      title: "الإنجازات",
      value: publishedAchievementsCount,
      description: "إنجازات منشورة ضمن نطاق المدرسة أو حسابك الحالي",
      href: canManageTeacherScope ? appRoutes.studentCareAchievements : undefined,
      icon: Award,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الرعاية الطلابية"
        description="أساس تشغيلي مختصر للصحة المدرسية، التطعيمات، العيادة، الانضباط، والإنجازات دون تشخيصات أو إشعارات خارجية."
        actions={
          canManageTeacherScope ? (
            <>
              <Link
                href={appRoutes.newStudentCareDiscipline}
                className={buttonVariants({ size: "lg" })}
              >
                سجل انضباط جديد
              </Link>
              <Link
                href={appRoutes.newStudentCareAchievement}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                إنجاز جديد
              </Link>
            </>
          ) : null
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-2xl">{card.value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
                {card.href ? (
                  <Link
                    href={card.href}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    فتح الصفحة
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    متاح للإدارة فقط
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
