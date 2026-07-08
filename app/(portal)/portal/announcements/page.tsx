import { Bell, CalendarDays, ShieldAlert } from "lucide-react"

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
import { listPortalAnnouncements } from "@/lib/portal/announcements"
import { requirePortalContext } from "@/lib/portal/context"
import {
  ANNOUNCEMENT_TARGET_TYPE_LABELS_AR,
  SCHOOL_EVENT_STATUS_LABELS_AR,
  SCHOOL_EVENT_STATUS_TONES,
  SCHOOL_EVENT_TARGET_TYPE_LABELS_AR,
} from "@/types/communication"

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function PortalAnnouncementsPage() {
  const contextResult = await requirePortalContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الإعلانات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإعلانات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const feed = await listPortalAnnouncements(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعلانات"
        description="إعلانات المدرسة والفعاليات المناسبة لسياق الصف أو الدور الحالي."
        actions={<StatusBadge status="info">عرض فقط</StatusBadge>}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>الإعلانات المنشورة</CardTitle>
            <CardDescription>
              لا تتضمن هذه المرحلة أي إشعارات خارجية أو تفاعل مباشر.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {feed.announcements.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="لا توجد إعلانات"
                description="لا توجد إعلانات منشورة مناسبة لهذا النطاق حاليًا."
              />
            ) : (
              feed.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {ANNOUNCEMENT_TARGET_TYPE_LABELS_AR[announcement.target_type]}
                      </p>
                    </div>
                    <StatusBadge status="success">منشور</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6">{announcement.body}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      النشر:{" "}
                      {announcement.published_at
                        ? formatDateTime(announcement.published_at)
                        : "غير متوفر"}
                    </span>
                    {announcement.class_name ? (
                      <span>
                        الشعبة: {announcement.class_name}
                        {announcement.class_section
                          ? ` - ${announcement.class_section}`
                          : ""}
                      </span>
                    ) : null}
                    {announcement.grade_level_name ? (
                      <span>الصف: {announcement.grade_level_name}</span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>الفعاليات المدرسية</CardTitle>
            <CardDescription>
              تعرض الفعاليات المدرسية المجدولة أو المكتملة فقط.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {feed.events.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="لا توجد فعاليات"
                description="لا توجد فعاليات مناسبة لهذا النطاق حاليًا."
              />
            ) : (
              feed.events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {SCHOOL_EVENT_TARGET_TYPE_LABELS_AR[event.target_type]}
                      </p>
                    </div>
                    <StatusBadge status={SCHOOL_EVENT_STATUS_TONES[event.status]}>
                      {SCHOOL_EVENT_STATUS_LABELS_AR[event.status]}
                    </StatusBadge>
                  </div>
                  {event.description ? (
                    <p className="mt-3 text-sm leading-6">{event.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>البداية: {formatDateTime(event.starts_at)}</p>
                    <p>النهاية: {formatDateTime(event.ends_at)}</p>
                    <p>المكان: {event.location ?? "غير متوفر"}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
