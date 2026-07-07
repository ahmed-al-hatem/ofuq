import { CalendarCheck2, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { USER_ROLES } from "@/constants/roles"
import {
  requireReportsContext,
  writeReportAuditLog,
} from "@/lib/reports/context"
import { loadAttendanceSummaryReport } from "@/lib/reports/attendance"

const reportRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function AttendanceSummaryReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const filters = await searchParams
  const contextResult = await requireReportsContext(reportRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تقرير الحضور" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تقرير الحضور"
          description={contextResult.error}
        />
      </div>
    )
  }

  const rows = await loadAttendanceSummaryReport(contextResult.data, filters)
  await writeReportAuditLog(contextResult.data, "attendance_summary")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تقرير الحضور"
        description="ملخص حالات الحضور حسب الطالب مع فلترة تاريخية بسيطة."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
          <CardDescription>اختر نطاقًا زمنيًا عند الحاجة.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row md:items-end">
            <FieldGroup className="grid flex-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="attendance-from">من تاريخ</FieldLabel>
                <Input id="attendance-from" name="from" type="date" defaultValue={filters.from} dir="ltr" />
              </Field>
              <Field>
                <FieldLabel htmlFor="attendance-to">إلى تاريخ</FieldLabel>
                <Input id="attendance-to" name="to" type="date" defaultValue={filters.to} dir="ltr" />
              </Field>
            </FieldGroup>
            <Button type="submit">تطبيق الفلتر</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>ملخص الحضور</CardTitle>
          <CardDescription>{rows.length} طالب لديهم سجلات حضور.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              icon={CalendarCheck2}
              title="لا توجد بيانات"
              description="لا توجد سجلات حضور مطابقة للنطاق الحالي."
            />
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-2 text-start">الطالب</th>
                  <th className="px-3 py-2 text-start">الشعبة</th>
                  <th className="px-3 py-2 text-start">حاضر</th>
                  <th className="px-3 py-2 text-start">غائب</th>
                  <th className="px-3 py-2 text-start">متأخر</th>
                  <th className="px-3 py-2 text-start">بعذر</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.student_id} className="border-b last:border-b-0">
                    <td className="px-3 py-3 font-medium">{row.student}</td>
                    <td className="px-3 py-3">{row.class_name ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.present_count}</td>
                    <td className="px-3 py-3">{row.absent_count}</td>
                    <td className="px-3 py-3">{row.late_count}</td>
                    <td className="px-3 py-3">{row.excused_count}</td>
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
