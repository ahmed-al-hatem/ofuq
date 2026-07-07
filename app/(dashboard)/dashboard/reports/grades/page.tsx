import { GraduationCap, ShieldAlert } from "lucide-react"

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
import { loadGradesSummaryReport } from "@/lib/reports/grades"

const reportRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function GradesSummaryReportPage() {
  const contextResult = await requireReportsContext(reportRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تقرير الدرجات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تقرير الدرجات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const rows = await loadGradesSummaryReport(contextResult.data)
  await writeReportAuditLog(contextResult.data, "grades_summary")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تقرير الدرجات"
        description="ملخص جاهز لنتائج الاختبارات ومدخلات الدرجات وحالة بطاقة التقرير."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>ملخص الدرجات</CardTitle>
          <CardDescription>{rows.length} صف ملخص درجات.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="لا توجد بيانات"
              description="لا توجد نتائج اختبارات أو مدخلات درجات مطابقة داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[880px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-2 text-start">الطالب</th>
                  <th className="px-3 py-2 text-start">الشعبة</th>
                  <th className="px-3 py-2 text-start">المادة</th>
                  <th className="px-3 py-2 text-start">نتائج الاختبارات</th>
                  <th className="px-3 py-2 text-start">مدخلات الدرجات</th>
                  <th className="px-3 py-2 text-start">بطاقة التقرير</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.student_id}:${row.subject ?? "none"}`}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium">{row.student}</td>
                    <td className="px-3 py-3">{row.class_name ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.subject ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.exam_result_summary}</td>
                    <td className="px-3 py-3">{row.grade_entry_summary}</td>
                    <td className="px-3 py-3">
                      {row.report_card_status ?? "لا توجد بطاقة"}
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
