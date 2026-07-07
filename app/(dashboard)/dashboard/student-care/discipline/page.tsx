import Link from "next/link"
import { ShieldAlert, TriangleAlert } from "lucide-react"

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
import { listDisciplineRecords } from "@/lib/student-care/discipline"
import { requireStudentCareContext } from "@/lib/student-care/context"
import {
  DISCIPLINE_INCIDENT_TYPE_LABELS_AR,
  DISCIPLINE_SEVERITY_LABELS_AR,
  DISCIPLINE_SEVERITY_TONES,
  DISCIPLINE_STATUS_LABELS_AR,
  DISCIPLINE_STATUS_TONES,
} from "@/types/student-care"
import { ReviewDisciplineRecordForm } from "../_components/student-care-forms"

const studentCareReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

function canReviewDiscipline(role: string) {
  return (
    role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.SCHOOL_ADMIN
  )
}

export default async function StudentCareDisciplinePage() {
  const contextResult = await requireStudentCareContext(studentCareReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="سجلات الانضباط" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى سجلات الانضباط"
          description={contextResult.error}
        />
      </div>
    )
  }

  const canReview = canReviewDiscipline(contextResult.data.role)
  const records = await listDisciplineRecords(contextResult.data, {
    actorOnly: !canReview,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="سجلات الانضباط"
        description="متابعة الحالات السلوكية والانضباطية الأساسية ضمن المدرسة الحالية."
        actions={
          <Link
            href={appRoutes.newStudentCareDiscipline}
            className={buttonVariants({ size: "lg" })}
          >
            سجل جديد
          </Link>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>السجل</CardTitle>
          <CardDescription>
            يعرض هذا الجدول الحالات التي أنشأتها أو جميع الحالات وفقًا لصلاحيتك.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {records.length === 0 ? (
            <EmptyState
              icon={TriangleAlert}
              title="لا توجد سجلات انضباط بعد"
              description="ابدأ بإضافة أول سجل لطالب نشط داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 text-start font-medium">الطالب</th>
                  <th className="py-3 text-start font-medium">التاريخ</th>
                  <th className="py-3 text-start font-medium">العنوان</th>
                  <th className="py-3 text-start font-medium">النوع</th>
                  <th className="py-3 text-start font-medium">الحدة</th>
                  <th className="py-3 text-start font-medium">الحالة</th>
                  <th className="py-3 text-start font-medium">المبلغ</th>
                  <th className="py-3 text-start font-medium">المراجعة</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/60 align-top">
                    <td className="py-3">
                      {record.students?.full_name ?? "طالب غير معروف"}
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {record.students?.student_number ?? "-"}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">{record.incident_date}</td>
                    <td className="py-3">
                      <p className="font-medium">{record.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {record.description}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {DISCIPLINE_INCIDENT_TYPE_LABELS_AR[record.incident_type]}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={DISCIPLINE_SEVERITY_TONES[record.severity]}>
                        {DISCIPLINE_SEVERITY_LABELS_AR[record.severity]}
                      </StatusBadge>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={DISCIPLINE_STATUS_TONES[record.status]}>
                        {DISCIPLINE_STATUS_LABELS_AR[record.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {record.reported_by?.full_name ?? "مستخدم غير معروف"}
                    </td>
                    <td className="py-3">
                      {canReview &&
                      record.status !== "resolved" &&
                      record.status !== "cancelled" ? (
                        <div className="flex flex-col gap-2">
                          {record.status !== "reviewed" ? (
                            <ReviewDisciplineRecordForm
                              recordId={record.id}
                              status="reviewed"
                              label="مراجعة"
                            />
                          ) : null}
                          <ReviewDisciplineRecordForm
                            recordId={record.id}
                            status="resolved"
                            label="إغلاق"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {record.reviewed_by?.full_name
                            ? `راجعها ${record.reviewed_by.full_name}`
                            : "-"}
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
