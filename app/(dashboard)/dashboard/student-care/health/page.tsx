import Link from "next/link"
import { HeartPulse, ShieldAlert } from "lucide-react"

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
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listHealthRecords } from "@/lib/student-care/health-records"
import { requireStudentCareContext } from "@/lib/student-care/context"
import {
  HEALTH_RECORD_STATUS_LABELS_AR,
  HEALTH_RECORD_STATUS_TONES,
} from "@/types/student-care"

const studentCareAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

function summarizeText(value: string | null) {
  if (!value) {
    return "لا توجد"
  }

  return value.length > 48 ? `${value.slice(0, 48)}...` : value
}

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function StudentCareHealthPage() {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="السجلات الصحية" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى السجلات الصحية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const records = await listHealthRecords(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="السجلات الصحية"
        description="ملف صحي مدرسي مختصر لكل طالب نشط داخل المدرسة الحالية."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الطلاب</CardTitle>
          <CardDescription>
            افتح صفحة الطالب لتحديث معلوماته الصحية الأساسية.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {records.length === 0 ? (
            <EmptyState
              icon={HeartPulse}
              title="لا توجد سجلات صحية بعد"
              description="يمكنك البدء بفتح صفحة أي طالب نشط وإضافة بياناته الصحية الأساسية."
            />
          ) : (
            <table className="w-full min-w-[920px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الطالب</th>
                  <th className="py-3 text-start font-medium">فصيلة الدم</th>
                  <th className="py-3 text-start font-medium">الحساسيات</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">آخر تحديث</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item) => (
                  <tr key={item.student.id} className="border-b border-border/60">
                    <td className="py-3">
                      <Link
                        href={appRoutes.studentCareHealthDetails(item.student.id)}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.student.full_name}
                      </Link>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {item.student.student_number}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {item.health_record?.blood_type ?? "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {summarizeText(item.health_record?.allergies ?? null)}
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        status={
                          item.health_record
                            ? HEALTH_RECORD_STATUS_TONES[item.health_record.status]
                            : "neutral"
                        }
                      >
                        {item.health_record
                          ? HEALTH_RECORD_STATUS_LABELS_AR[item.health_record.status]
                          : "لا يوجد سجل"}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(item.health_record?.updated_at ?? null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
