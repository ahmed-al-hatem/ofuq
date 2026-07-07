import Link from "next/link"
import { HeartPulse, ShieldAlert } from "lucide-react"

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
import { loadStudentHealthRecordDetail } from "@/lib/student-care/health-records"
import { requireStudentCareContext } from "@/lib/student-care/context"
import { STUDENT_STATUS_LABELS_AR, STUDENT_STATUS_TONES } from "@/types/students"
import { HealthRecordForm } from "../../_components/student-care-forms"

const studentCareAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

type StudentHealthDetailsPageProps = {
  params: Promise<{ studentId: string }>
}

export default async function StudentHealthDetailsPage({
  params,
}: StudentHealthDetailsPageProps) {
  const { studentId } = await params
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل السجل الصحي" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى السجل الصحي"
          description={contextResult.error}
        />
      </div>
    )
  }

  const detail = await loadStudentHealthRecordDetail(
    contextResult.data,
    studentId
  )

  if (!detail) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل السجل الصحي" />
        <EmptyState
          icon={HeartPulse}
          title="الطالب غير موجود"
          description="تعذر العثور على الطالب داخل المدرسة الحالية."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`السجل الصحي - ${detail.student.full_name}`}
        description="تحديث بيانات صحية مدرسية أساسية دون تشخيصات أو ملفات طبية."
        actions={
          <Link
            href={appRoutes.studentCareHealth}
            className={buttonVariants({ variant: "outline" })}
          >
            العودة للسجلات الصحية
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>بيانات الطالب</CardTitle>
          <CardDescription>التحقق من الطالب يتم على الخادم قبل الحفظ.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الطالب</p>
            <p className="mt-1 font-medium">{detail.student.full_name}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الرقم</p>
            <p className="mt-1 text-sm" dir="ltr">
              {detail.student.student_number}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">الحالة</p>
            <div className="mt-1">
              <StatusBadge status={STUDENT_STATUS_TONES[detail.student.status]}>
                {STUDENT_STATUS_LABELS_AR[detail.student.status]}
              </StatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>

      <HealthRecordForm student={detail.student} healthRecord={detail.health_record} />
    </div>
  )
}
