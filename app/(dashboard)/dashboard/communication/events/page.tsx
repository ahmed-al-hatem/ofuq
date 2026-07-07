import Link from "next/link"
import { CalendarDays, ShieldAlert } from "lucide-react"

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
import { requireCommunicationContext } from "@/lib/communication/context"
import { listSchoolEvents } from "@/lib/communication/events"
import {
  SCHOOL_EVENT_STATUS_LABELS_AR,
  SCHOOL_EVENT_STATUS_TONES,
  SCHOOL_EVENT_TARGET_TYPE_LABELS_AR,
} from "@/types/communication"
import { CancelSchoolEventForm } from "@/app/(dashboard)/dashboard/communication/_components/communication-forms"

const communicationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatTarget(event: Awaited<ReturnType<typeof listSchoolEvents>>[number]) {
  if (event.target_type === "grade_level") {
    return event.grade_levels?.name ?? "صف غير معروف"
  }

  if (event.target_type === "class") {
    return event.classes?.name ?? "شعبة غير معروفة"
  }

  return SCHOOL_EVENT_TARGET_TYPE_LABELS_AR[event.target_type]
}

export default async function CommunicationEventsPage() {
  const contextResult = await requireCommunicationContext(communicationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الأحداث" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الأحداث"
          description={contextResult.error}
        />
      </div>
    )
  }

  const events = await listSchoolEvents(contextResult.data)
  const canManage =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الأحداث"
        description="تقويم مدرسي بسيط دون مزامنة خارجية أو تكرار."
        actions={
          canManage ? (
            <Link
              href={appRoutes.newCommunicationEvent}
              className={buttonVariants({ size: "lg" })}
            >
              حدث جديد
            </Link>
          ) : null
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="لا توجد أحداث بعد"
          description="يمكن للإدارة إنشاء أحداث مدرسية بسيطة مرتبطة بجمهور واضح."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      {formatDate(event.starts_at)} - {formatDate(event.ends_at)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={SCHOOL_EVENT_STATUS_TONES[event.status]}>
                    {SCHOOL_EVENT_STATUS_LABELS_AR[event.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  الجمهور: {formatTarget(event)}
                </p>
                <p className="text-sm text-muted-foreground">
                  الموقع: {event.location ?? "غير محدد"}
                </p>
                {event.description ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
                {canManage && event.status === "scheduled" ? (
                  <CancelSchoolEventForm eventId={event.id} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
