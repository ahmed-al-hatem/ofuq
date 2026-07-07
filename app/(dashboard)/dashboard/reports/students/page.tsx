import { ShieldAlert, Users2 } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { USER_ROLES } from "@/constants/roles"
import {
  requireReportsContext,
  writeReportAuditLog,
} from "@/lib/reports/context"
import { loadStudentRosterReport } from "@/lib/reports/students"

const reportRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.ACCOUNTANT,
] as const

export default async function StudentRosterReportPage() {
  const contextResult = await requireReportsContext(reportRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تقرير الطلاب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تقرير الطلاب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const rows = await loadStudentRosterReport(contextResult.data)
  await writeReportAuditLog(contextResult.data, "student_roster")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تقرير الطلاب"
        description="قائمة الطلاب مع الحالة والصف والشعبة وولي الأمر الأساسي عند توفره."
      />
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>سجل الطلاب</CardTitle>
          <CardDescription>{rows.length} طالب في النطاق الحالي.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              icon={Users2}
              title="لا توجد بيانات"
              description="لا توجد سجلات طلاب مطابقة داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-2 text-start">رقم الطالب</th>
                  <th className="px-3 py-2 text-start">اسم الطالب</th>
                  <th className="px-3 py-2 text-start">الحالة</th>
                  <th className="px-3 py-2 text-start">الصف</th>
                  <th className="px-3 py-2 text-start">الشعبة</th>
                  <th className="px-3 py-2 text-start">ولي الأمر</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.student_number} className="border-b last:border-b-0">
                    <td className="px-3 py-3">{row.student_number}</td>
                    <td className="px-3 py-3 font-medium">{row.student_name}</td>
                    <td className="px-3 py-3">{row.status}</td>
                    <td className="px-3 py-3">{row.grade_level ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.class_name ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.guardian ?? "غير محدد"}</td>
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
