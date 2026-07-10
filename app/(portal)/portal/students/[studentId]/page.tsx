import Link from "next/link"
import { ShieldAlert, UserRound } from "lucide-react"

import { PortalReadOnlyNotice } from "@/components/portal/portal-read-only-notice"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import {
  assertPortalStudentAccess,
  requirePortalContext,
} from "@/lib/portal/context"
import { getPortalStudentById } from "@/lib/portal/students"
import {
  GUARDIAN_RELATION_LABELS_AR,
  STUDENT_GENDER_LABELS_AR,
  STUDENT_STATUS_LABELS_AR,
  STUDENT_STATUS_TONES,
} from "@/types/students"

type PortalStudentDetailsPageProps = {
  params: Promise<{ studentId: string }>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function PortalStudentDetailsPage({
  params,
}: PortalStudentDetailsPageProps) {
  const { studentId } = await params
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الطالب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى سجل الطالب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const context = contextResult.data
  assertPortalStudentAccess(context, studentId)

  const student = await getPortalStudentById(context, studentId)

  if (!student) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الطالب" />
        <EmptyState
          icon={UserRound}
          title="تعذر العثور على الطالب"
          description="قد يكون السجل غير متاح ضمن نطاق هذه البوابة حاليًا."
        />
      </div>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={student.full_name}
        description="عرض تفصيلي للبيانات الأساسية المسموح بها فقط ضمن ارتباط هذا الحساب بالطالب."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={STUDENT_STATUS_TONES[student.status]}>
              {STUDENT_STATUS_LABELS_AR[student.status]}
            </StatusBadge>
            <StatusBadge status="info">عرض فقط</StatusBadge>
          </div>
        }
      />

      <PortalReadOnlyNotice
        title="ملف الطالب للمتابعة فقط"
        description="يمكنك من هذه الصفحة مراجعة الهوية الدراسية والروابط الأساسية، بينما تبقى أي تحديثات أو تصحيحات ضمن متابعة المدرسة."
        notes={[
          "تعرض صفحة الطالب التسجيل الصفي النشط فقط حتى تبقى المعلومات واضحة وسهلة القراءة.",
          "روابط الحضور والدرجات والجدول أدناه تنقلك مباشرة إلى نفس نطاق الطالب داخل البوابة.",
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-2">
            <CardDescription>الرقم الطلابي</CardDescription>
            <CardTitle className="text-xl">{student.student_number}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-2">
            <CardDescription>الصف الحالي</CardDescription>
            <CardTitle className="text-xl">
              {student.active_enrollment?.grade_level_name ?? "غير متوفر"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-2">
            <CardDescription>العام الدراسي</CardDescription>
            <CardTitle className="text-xl">
              {student.active_enrollment?.academic_year_name ?? "غير متوفر"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-2">
            <CardDescription>جهات التواصل</CardDescription>
            <CardTitle className="text-xl">{student.guardians.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>البيانات الأساسية</CardTitle>
            <CardDescription>
              <span className="inline-flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {student.student_number}
                </Badge>
                <span>آخر البيانات المتاحة من المدرسة</span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                الجنس
              </p>
              <p className="mt-1 text-sm leading-6">
                {student.gender
                  ? STUDENT_GENDER_LABELS_AR[student.gender]
                  : "غير محدد"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                تاريخ الميلاد
              </p>
              <p className="mt-1 text-sm leading-6">
                {student.birth_date ? formatDate(student.birth_date) : "غير متوفر"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                الجنسية
              </p>
              <p className="mt-1 text-sm leading-6">
                {student.nationality ?? "غير متوفرة"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                تاريخ الالتحاق
              </p>
              <p className="mt-1 text-sm leading-6">
                {formatDate(student.enrolled_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>التسجيل الصفي</CardTitle>
            <CardDescription>يتم عرض التسجيل النشط فقط.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {student.active_enrollment ? (
              <>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الصف
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {student.active_enrollment.grade_level_name}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الشعبة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {student.active_enrollment.class_name}
                    {student.active_enrollment.class_section
                      ? ` - ${student.active_enrollment.class_section}`
                      : ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    العام الدراسي
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {student.active_enrollment.academic_year_name}
                  </p>
                </div>
              </>
            ) : (
              <EmptyState
                title="لا يوجد تسجيل صفي نشط"
                description="لا يظهر في هذا السجل أي صف نشط مرتبط بالطالب حاليًا."
              />
            )}
          </CardContent>
        </Card>
      </section>

      {student.guardians.length > 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>ملخص أولياء الأمور</CardTitle>
            <CardDescription>يعرض للقراءة فقط ضمن سياق ولي الأمر.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {student.guardians.map((guardian) => (
              <div
                key={guardian.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <p className="font-medium">{guardian.guardian_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {GUARDIAN_RELATION_LABELS_AR[guardian.relation]}
                </p>
                <p className="mt-2 text-sm leading-6">
                  {guardian.guardian_phone}
                </p>
                <p className="text-sm leading-6">
                  {guardian.guardian_email ?? "لا يوجد بريد إلكتروني"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href={appRoutes.portalAttendance}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-full`}
        >
          متابعة الحضور
        </Link>
        <Link
          href={appRoutes.portalGrades}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-full`}
        >
          متابعة الدرجات
        </Link>
        <Link
          href={appRoutes.portalTimetable}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-full`}
        >
          متابعة الجدول
        </Link>
      </div>
    </PageShell>
  )
}
