import { Bell, ShieldAlert } from "lucide-react"

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
import { requireCommunicationContext } from "@/lib/communication/context"
import { listNotificationLogs } from "@/lib/communication/notifications"
import {
  NOTIFICATION_CHANNEL_LABELS_AR,
  NOTIFICATION_STATUS_LABELS_AR,
  NOTIFICATION_STATUS_TONES,
} from "@/types/communication"
import { MarkNotificationReadForm } from "@/app/(dashboard)/dashboard/communication/_components/communication-forms"

const notificationRoles = [
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

export default async function CommunicationNotificationsPage() {
  const contextResult = await requireCommunicationContext(notificationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الإشعارات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإشعارات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const schoolWide =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const notifications = await listNotificationLogs(
    contextResult.data,
    schoolWide
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإشعارات"
        description="سجل إشعارات داخل التطبيق فقط، دون إرسال بريد أو SMS أو WhatsApp."
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="لا توجد إشعارات"
          description="سيظهر هنا سجل الإشعارات الداخلية الناتجة عن الرسائل والإعلانات والأحداث."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription>
                      {NOTIFICATION_CHANNEL_LABELS_AR[notification.channel]} -{" "}
                      {formatDate(notification.created_at)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={NOTIFICATION_STATUS_TONES[notification.status]}>
                    {NOTIFICATION_STATUS_LABELS_AR[notification.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {notification.body ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {notification.body}
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  المستلم: {notification.recipient?.full_name ?? "سجل عام"}
                </p>
                {notification.status !== "read" ? (
                  <MarkNotificationReadForm notificationId={notification.id} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
