import Link from "next/link"
import { ShieldAlert, Users2 } from "lucide-react"

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import { requirePortalContext } from "@/lib/portal/context"
import { listPortalStudents } from "@/lib/portal/students"
import {
  GUARDIAN_RELATION_LABELS_AR,
  STUDENT_GENDER_LABELS_AR,
  STUDENT_STATUS_LABELS_AR,
  STUDENT_STATUS_TONES,
} from "@/types/students"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function PortalStudentsPage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الطلاب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى بيانات الطلاب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const context = contextResult.data
  const students = await listPortalStudents(context)

  return (
    <PageShell>
      <PageHeader
        title={context.role === "parent" ? "الأبناء" : "بياناتي"}
        description="تظهر هنا البطاقات الأساسية للطلاب المرتبطين بهذا الحساب مع ملخص سريع للصف الحالي وحالة الارتباط."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <PortalReadOnlyNotice
        title={
          context.role === "parent"
            ? "متابعة الأبناء من شاشة واحدة"
            : "هذه بياناتك الأساسية داخل البوابة"
        }
        description={
          context.role === "parent"
            ? "اختر بطاقة الطالب لعرض تفاصيله، ثم انتقل إلى الحضور أو الدرجات أو الجدول من الروابط المخصصة لذلك."
            : "تعرض هذه البطاقات أحدث البيانات المتاحة لك من المدرسة دون أي إجراءات تعديل أو إدخال."
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="لا توجد بيانات طلاب متاحة"
          description="لا يوجد طالب مرتبط بهذا الحساب داخل المدرسة الحالية بعد."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {students.map((student) => (
            <Card key={student.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{student.full_name}</CardTitle>
                      <Badge variant="outline" className="rounded-full">
                        {student.student_number}
                      </Badge>
                    </div>
                    <CardDescription>
                      {student.active_enrollment
                        ? `${student.active_enrollment.grade_level_name} - ${student.active_enrollment.class_name}`
                        : "لا يوجد تسجيل صفي نشط"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={STUDENT_STATUS_TONES[student.status]}>
                    {STUDENT_STATUS_LABELS_AR[student.status]}
                  </StatusBadge>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {student.active_enrollment ? (
                    <>
                      <Badge variant="secondary" className="rounded-full">
                        {student.active_enrollment.grade_level_name}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {student.active_enrollment.academic_year_name}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="rounded-full">
                      بدون تسجيل صفي نشط
                    </Badge>
                  )}
                  {student.guardians.length > 0 ? (
                    <Badge variant="outline" className="rounded-full">
                      أولياء الأمور {student.guardians.length}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
                      تاريخ الالتحاق
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDate(student.enrolled_at)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الصف الحالي
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {student.active_enrollment
                      ? `${student.active_enrollment.class_name}${student.active_enrollment.class_section ? ` - ${student.active_enrollment.class_section}` : ""}`
                      : "لا يوجد تسجيل صفي نشط"}
                  </p>
                </div>

                {student.guardians.length > 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      بيانات ولي الأمر
                    </p>
                    <div className="mt-2 flex flex-col gap-2 text-sm leading-6">
                      {student.guardians.map((guardian) => (
                        <div
                          key={guardian.id}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <p>
                            {guardian.guardian_name} -{" "}
                            {GUARDIAN_RELATION_LABELS_AR[guardian.relation]}
                          </p>
                          {guardian.is_primary ? (
                            <Badge variant="secondary" className="rounded-full">
                              جهة التواصل الأساسية
                            </Badge>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>

              <CardFooter className="pt-0">
                <Link
                  href={appRoutes.portalStudentDetails(student.id)}
                  className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-full`}
                >
                  متابعة السجل الكامل
                </Link>
              </CardFooter>
            </Card>
          ))}
        </section>
      )}
    </PageShell>
  )
}
