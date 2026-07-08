import { ShieldAlert, UserRound } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRoleLabel } from "@/lib/auth/session"
import { requirePortalContext } from "@/lib/portal/context"
import { listPortalStudents } from "@/lib/portal/students"

export default async function PortalProfilePage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الملف الشخصي" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الملف الشخصي"
          description={contextResult.error}
        />
      </div>
    )
  }

  const context = contextResult.data
  const students = await listPortalStudents(context)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الملف الشخصي"
        description="ملخص الحساب الحالي ونطاق الوصول المسموح داخل البوابة."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>بيانات الحساب</CardTitle>
            <CardDescription>تُعرض بيانات العضوية الحالية فقط.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                الاسم
              </p>
              <p className="mt-1 text-sm leading-6">
                {context.profile.display_name ?? context.profile.full_name}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                الدور
              </p>
              <p className="mt-1 text-sm leading-6">
                {getRoleLabel(context.role)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                البريد الإلكتروني
              </p>
              <p className="mt-1 text-sm leading-6">
                {context.user.email ?? "غير متوفر"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                رقم الهاتف
              </p>
              <p className="mt-1 text-sm leading-6">
                {context.profile.phone ?? "غير متوفر"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>نطاق الوصول</CardTitle>
            <CardDescription>
              يتم اشتقاقه خادميًا من العضوية الحالية والروابط الفعلية بالطلاب.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                عدد الطلاب المسموح بعرضهم
              </p>
              <p className="mt-1 text-sm leading-6">{students.length}</p>
            </div>
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="font-medium">{student.full_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {student.student_number}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={UserRound}
                title="لا توجد روابط طلاب"
                description="لن تظهر بقية وحدات البوابة بيانات طالبية حتى يتم ربط هذا الحساب بطالب داخل المدرسة."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
