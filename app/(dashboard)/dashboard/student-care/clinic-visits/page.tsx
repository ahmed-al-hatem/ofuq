import Link from "next/link"
import { ShieldAlert, Stethoscope } from "lucide-react"

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
import { listClinicVisits } from "@/lib/student-care/clinic-visits"
import { requireStudentCareContext } from "@/lib/student-care/context"
import {
  CLINIC_VISIT_STATUS_LABELS_AR,
  CLINIC_VISIT_STATUS_TONES,
} from "@/types/student-care"
import { CloseClinicVisitForm } from "../_components/student-care-forms"

const studentCareAdminRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
] as const

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function StudentCareClinicVisitsPage() {
  const contextResult = await requireStudentCareContext(studentCareAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="زيارات العيادة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى زيارات العيادة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const visits = await listClinicVisits(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="زيارات العيادة"
        description="تسجيل الزيارات الصحية المدرسية وإغلاق الحالات المفتوحة."
        actions={
          <Link
            href={appRoutes.newStudentCareClinicVisit}
            className={buttonVariants({ size: "lg" })}
          >
            زيارة جديدة
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>سجل الزيارات</CardTitle>
          <CardDescription>
            يمكن إغلاق الزيارة المفتوحة من داخل نفس الجدول.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {visits.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="لا توجد زيارات عيادة بعد"
              description="ابدأ بإضافة أول زيارة لطالب نشط داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الطالب</th>
                  <th className="py-3 text-start font-medium">وقت الزيارة</th>
                  <th className="py-3 text-start font-medium">السبب</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">ولي الأمر</th>
                  <th className="py-3 text-start font-medium">إحالة خارجية</th>
                  <th className="py-3 text-start font-medium">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id} className="border-b border-border/60 align-top">
                    <td className="py-3">
                      {visit.students?.full_name ?? "طالب غير معروف"}
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {visit.students?.student_number ?? "-"}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(visit.visited_at)}
                    </td>
                    <td className="py-3">{visit.reason}</td>
                    <td className="py-3">
                      <StatusBadge status={CLINIC_VISIT_STATUS_TONES[visit.status]}>
                        {CLINIC_VISIT_STATUS_LABELS_AR[visit.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {visit.guardian_contacted ? "تم" : "لم يتم"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {visit.referred_to_external_care ? "نعم" : "لا"}
                    </td>
                    <td className="py-3">
                      {visit.status === "open" ? (
                        <CloseClinicVisitForm visitId={visit.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          أغلقت {visit.closed_at ? formatDate(visit.closed_at) : ""}
                        </span>
                      )}
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
