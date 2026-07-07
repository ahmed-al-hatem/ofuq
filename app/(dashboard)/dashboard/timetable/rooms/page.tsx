import { DoorOpen, ShieldAlert } from "lucide-react"

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
import { requireTimetableContext } from "@/lib/timetable/context"
import { listRooms } from "@/lib/timetable/rooms"
import { ROOM_STATUS_LABELS_AR, ROOM_STATUS_TONES } from "@/types/timetable"
import { RoomForm } from "../_components/timetable-forms"

const timetableReadRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
] as const

export default async function TimetableRoomsPage() {
  const contextResult = await requireTimetableContext(timetableReadRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="غرف الجدول" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى غرف الجدول"
          description={contextResult.error}
        />
      </div>
    )
  }

  const rooms = await listRooms(contextResult.data)
  const canMutate =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="غرف الجدول"
        description="غرف بسيطة تستخدم اختياريًا في منع تعارض الحصص."
      />

      {canMutate ? <RoomForm /> : null}

      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="لا توجد غرف بعد"
          description="يمكن إنشاء حصة بدون غرفة، لكن إضافة الغرف تفعّل منع تعارض الغرفة."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription dir={room.code ? "ltr" : "rtl"}>
                      {room.code ?? "بدون رمز"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={ROOM_STATUS_TONES[room.status]}>
                    {ROOM_STATUS_LABELS_AR[room.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">السعة</p>
                  <p className="mt-1 text-sm leading-6">
                    {room.capacity ?? "غير محددة"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">الموقع</p>
                  <p className="mt-1 text-sm leading-6">
                    {room.location ?? "غير محدد"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
