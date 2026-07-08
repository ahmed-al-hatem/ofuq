import { CalendarDays, ShieldAlert } from "lucide-react"

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
import { requirePortalContext } from "@/lib/portal/context"
import { listPortalTimetableSlots } from "@/lib/portal/timetable"
import {
  TIMETABLE_DAY_LABELS_AR,
  TIMETABLE_SLOT_STATUS_LABELS_AR,
  TIMETABLE_SLOT_STATUS_TONES,
} from "@/types/timetable"

function formatTime(value: string) {
  return value.slice(0, 5)
}

export default async function PortalTimetablePage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الجدول" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الجدول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const slots = await listPortalTimetableSlots(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الجدول"
        description="يعرض الحصص النشطة للشعب المرتبطة بالطلاب المسموح بعرضهم فقط."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>الحصص</CardTitle>
          <CardDescription>
            هذا العرض لا يسمح بطلب تغيير الحصة أو تعديل توزيعها.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {slots.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="لا توجد حصص متاحة"
              description="لا يوجد جدول نشط مرتبط بالطلاب المسموح بعرضهم حاليًا."
            />
          ) : (
            slots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{slot.subject_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {slot.class_name}
                      {slot.class_section ? ` - ${slot.class_section}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={TIMETABLE_SLOT_STATUS_TONES[slot.status]}>
                    {TIMETABLE_SLOT_STATUS_LABELS_AR[slot.status]}
                  </StatusBadge>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      اليوم
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {TIMETABLE_DAY_LABELS_AR[slot.day_of_week]}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      الوقت
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {formatTime(slot.starts_at)} - {formatTime(slot.ends_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      المعلم / القاعة
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {slot.teacher_name ?? "غير متوفر"}
                      {slot.room_name ? ` - ${slot.room_name}` : ""}
                    </p>
                  </div>
                </div>

                {slot.notes ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {slot.notes}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
