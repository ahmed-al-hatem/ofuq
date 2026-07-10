import {
  CalendarCheck2,
  CircleCheckBig,
  CircleX,
  Clock3,
  ShieldAlert,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { KpiGrid } from "@/components/shared/kpi-grid"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { listPortalAttendanceRecords } from "@/lib/portal/attendance"
import { requirePortalContext } from "@/lib/portal/context"
import {
  ABSENCE_EXCUSE_STATUS_LABELS_AR,
  ABSENCE_EXCUSE_STATUS_TONES,
  ATTENDANCE_RECORD_METHOD_LABELS_AR,
  ATTENDANCE_STATUS_LABELS_AR,
  ATTENDANCE_STATUS_TONES,
} from "@/types/attendance"

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDate(value: string | null) {
  if (!value) {
    return "غير متوفر"
  }

  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export default async function PortalAttendancePage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الحضور" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى سجل الحضور"
          description={contextResult.error}
        />
      </div>
    )
  }

  const records = await listPortalAttendanceRecords(contextResult.data)
  const presentCount = records.filter((record) => record.status === "present").length
  const absentCount = records.filter((record) => record.status === "absent").length
  const lateCount = records.filter((record) => record.status === "late").length
  const excusedCount = records.filter((record) => record.status === "excused").length

  return (
    <PageShell>
      <PageHeader
        title="الحضور"
        description="عرض قراءة فقط لسجلات الحضور المرتبطة بالطلاب المسموح بهم."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      {records.length > 0 ? (
        <KpiGrid
          items={[
            {
              title: "حاضر",
              value: presentCount,
              description: "عدد السجلات التي أُثبت فيها حضور الطالب.",
              icon: CircleCheckBig,
              tone: "success",
            },
            {
              title: "متأخر",
              value: lateCount,
              description: "حالات تأخر مسجلة ضمن نفس النطاق.",
              icon: Clock3,
              tone: "warning",
            },
            {
              title: "غائب",
              value: absentCount,
              description: "سجلات الغياب غير المعذور المعروضة لك.",
              icon: CircleX,
              tone: "danger",
            },
            {
              title: "بعذر",
              value: excusedCount,
              description: "حالات الغياب المعذور أو المرتبطة بعذر.",
              icon: CalendarCheck2,
              tone: "info",
            },
          ]}
        />
      ) : null}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>سجل الحضور</CardTitle>
          <CardDescription>
            لا يمكن من هذه البوابة إرسال أعذار غياب أو تعديل السجلات.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {records.length === 0 ? (
            <EmptyState
              icon={CalendarCheck2}
              title="لا توجد سجلات حضور متاحة"
              description="لا توجد جلسات حضور مرتبطة بالطلاب المسموح بعرضهم حاليًا."
            />
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {record.student_name} - {record.student_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.class_name
                        ? `${record.class_name}${record.class_section ? ` - ${record.class_section}` : ""}`
                        : "شعبة غير متوفرة"}
                    </p>
                  </div>
                  <StatusBadge status={ATTENDANCE_STATUS_TONES[record.status]}>
                    {ATTENDANCE_STATUS_LABELS_AR[record.status]}
                  </StatusBadge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      تاريخ الجلسة
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDate(record.session_date)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      طريقة التسجيل
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {ATTENDANCE_RECORD_METHOD_LABELS_AR[record.method]}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      وقت التسجيل
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatDateTime(record.recorded_at)}
                    </p>
                  </div>
                </div>

                {record.excuse_status ? (
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={ABSENCE_EXCUSE_STATUS_TONES[record.excuse_status]}
                    >
                      {ABSENCE_EXCUSE_STATUS_LABELS_AR[record.excuse_status]}
                    </StatusBadge>
                    <p className="text-sm text-muted-foreground">
                      حالة العذر الحالي
                    </p>
                  </div>
                ) : null}

                {record.notes ? (
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      ملاحظات المدرسة
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {record.notes}
                    </p>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
