import Link from "next/link"
import { FileText, ShieldAlert } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import {
  approveAdmissionAction,
  updateAdmissionStatusAction,
} from "@/lib/actions/admissions"
import { listAdmissions } from "@/lib/students/admissions"
import { requireStudentContext } from "@/lib/students/context"
import {
  ADMISSION_STATUS_LABELS_AR,
  ADMISSION_STATUS_TONES,
  GUARDIAN_RELATION_LABELS_AR,
} from "@/types/students"

const admissionAccessRoles = [
  USER_ROLES.PARENT,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function AdmissionsPage() {
  const contextResult = await requireStudentContext(admissionAccessRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="القبول"
          description="متابعة طلبات القبول من داخل نطاق المدرسة الحالي."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى صفحة القبول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const admissions = await listAdmissions(contextResult.data)
  const canManageAdmissions =
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN ||
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="القبول"
        description="طلبات القبول مرتبطة دائمًا بالمستأجر والمدرسة الحاليين من سياق العضوية النشطة."
        actions={
          <Link href={appRoutes.newAdmission} className={buttonVariants({ size: "lg" })}>
            طلب قبول جديد
          </Link>
        }
      />

      {admissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="لا توجد طلبات قبول بعد"
          description="بمجرد إنشاء أول طلب قبول سيظهر هنا مع الحالة وبيانات ولي الأمر."
        />
      ) : (
        <section className="grid gap-4">
          {admissions.map((admission) => (
            <Card key={admission.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{admission.student_full_name}</CardTitle>
                    <CardDescription>
                      ولي الأمر: {admission.guardian_name}
                    </CardDescription>
                  </div>
                  <StatusBadge status={ADMISSION_STATUS_TONES[admission.status]}>
                    {ADMISSION_STATUS_LABELS_AR[admission.status]}
                  </StatusBadge>
                </div>
              </CardHeader>

              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    هاتف ولي الأمر
                  </p>
                  <p className="mt-1 text-sm leading-6" dir="ltr">
                    {admission.guardian_phone}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    تاريخ التقديم
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {formatDate(admission.submitted_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    العلاقة
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {GUARDIAN_RELATION_LABELS_AR[admission.guardian_relation]}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    الملاحظات
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {admission.notes ?? "لا توجد ملاحظات إضافية."}
                  </p>
                </div>

                {admission.decision_notes ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      ملاحظات القرار
                    </p>
                    <p className="mt-1 text-sm leading-6">{admission.decision_notes}</p>
                  </div>
                ) : null}
              </CardContent>

              {canManageAdmissions && admission.status === "pending" ? (
                <CardFooter className="flex flex-wrap gap-2">
                  <form action={approveAdmissionAction}>
                    <input type="hidden" name="admission_id" value={admission.id} />
                    <Button type="submit" size="sm">
                      اعتماد وإنشاء سجل طالب
                    </Button>
                  </form>

                  <form action={updateAdmissionStatusAction}>
                    <input type="hidden" name="admission_id" value={admission.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Button type="submit" variant="outline" size="sm">
                      رفض الطلب
                    </Button>
                  </form>
                </CardFooter>
              ) : null}
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
