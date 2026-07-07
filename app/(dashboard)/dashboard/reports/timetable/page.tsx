import { CalendarDays, ShieldAlert } from "lucide-react"

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
import { loadTimetableOverviewReport } from "@/lib/reports/timetable"

const reportRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function TimetableOverviewReportPage() {
  const contextResult = await requireReportsContext(reportRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تقرير الجدول" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى تقرير الجدول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const rows = await loadTimetableOverviewReport(contextResult.data)
  await writeReportAuditLog(contextResult.data, "timetable_overview")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تقرير الجدول"
        description="نظرة عامة على الحصص النشطة للجدول اليدوي."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الحصص النشطة</CardTitle>
          <CardDescription>{rows.length} حصة نشطة في الجدول.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="لا توجد بيانات"
              description="لا توجد حصص جدول نشطة داخل المدرسة الحالية."
            />
          ) : (
            <table className="w-full min-w-[820px] text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-2 text-start">اليوم</th>
                  <th className="px-3 py-2 text-start">الشعبة</th>
                  <th className="px-3 py-2 text-start">المادة</th>
                  <th className="px-3 py-2 text-start">المعلم</th>
                  <th className="px-3 py-2 text-start">الغرفة</th>
                  <th className="px-3 py-2 text-start">البداية</th>
                  <th className="px-3 py-2 text-start">النهاية</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.day}:${row.class_name}:${row.subject}:${row.starts_at}`}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium">{row.day}</td>
                    <td className="px-3 py-3">{row.class_name ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.subject ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.teacher ?? "غير محدد"}</td>
                    <td className="px-3 py-3">{row.room ?? "بدون غرفة"}</td>
                    <td className="px-3 py-3">{row.starts_at}</td>
                    <td className="px-3 py-3">{row.ends_at}</td>
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
