import Link from "next/link"
import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  Layers3,
  ShieldAlert,
  UsersRound,
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
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { requireAcademicContext } from "@/lib/academic/context"
import {
  listAcademicYears,
  listClassEnrollments,
  listClasses,
  listGradeLevels,
  listSubjects,
} from "@/lib/academic/academic-structure"

const academicReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function AcademicOverviewPage() {
  const contextResult = await requireAcademicContext(academicReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الأكاديمي"
          description="إدارة السنوات الدراسية والصفوف والشعب والمواد والتسجيلات."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الوحدة الأكاديمية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [academicYears, gradeLevels, classes, subjects, enrollments] =
    await Promise.all([
      listAcademicYears(contextResult.data),
      listGradeLevels(contextResult.data),
      listClasses(contextResult.data),
      listSubjects(contextResult.data),
      listClassEnrollments(contextResult.data),
    ])

  const overviewCards = [
    {
      title: "السنوات والفصول",
      value: academicYears.length,
      href: appRoutes.academicYears,
      icon: CalendarRange,
      description: "إعداد السنة الدراسية والفصول داخلها.",
    },
    {
      title: "الصفوف الدراسية",
      value: gradeLevels.length,
      href: appRoutes.academicGradeLevels,
      icon: Layers3,
      description: "تعريف المراحل والصفوف بترتيب واضح.",
    },
    {
      title: "الشعب",
      value: classes.length,
      href: appRoutes.academicClasses,
      icon: GraduationCap,
      description: "إنشاء شعب مرتبطة بسنة وصف.",
    },
    {
      title: "المواد",
      value: subjects.length,
      href: appRoutes.academicSubjects,
      icon: BookOpen,
      description: "تعريف المواد وربطها بالصفوف.",
    },
    {
      title: "تسجيلات الطلاب",
      value: enrollments.length,
      href: appRoutes.academicEnrollments,
      icon: UsersRound,
      description: "تسجيل الطلاب في الشعب للسنة الدراسية.",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الأكاديمي"
        description="تأسيس الهيكل الدراسي المطلوب للحضور والدرجات والجداول لاحقًا، مع ربط كل سجل بالمدرسة الحالية."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => {
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
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح الصفحة
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>حدود هذه المرحلة</CardTitle>
          <CardDescription>
            هذه المرحلة تؤسس الهيكل فقط. الحضور والدرجات والجداول والتقارير تبقى مراحل لاحقة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBadge status="info">
            السياق مستمد من العضوية النشطة، وليس من نماذج الواجهة.
          </StatusBadge>
        </CardContent>
      </Card>
    </div>
  )
}
