import Link from "next/link"
import { Megaphone, ShieldAlert } from "lucide-react"

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
import { USER_ROLE_LABELS_AR, USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { listAnnouncements } from "@/lib/communication/announcements"
import { requireCommunicationContext } from "@/lib/communication/context"
import {
  ANNOUNCEMENT_STATUS_LABELS_AR,
  ANNOUNCEMENT_STATUS_TONES,
  ANNOUNCEMENT_TARGET_TYPE_LABELS_AR,
} from "@/types/communication"
import { AnnouncementActions } from "@/app/(dashboard)/dashboard/communication/_components/communication-forms"

const communicationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

function formatDate(value: string | null) {
  if (!value) {
    return "غير منشور"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatTarget(
  announcement: Awaited<ReturnType<typeof listAnnouncements>>[number]
) {
  if (announcement.target_type === "role" && announcement.target_role) {
    return USER_ROLE_LABELS_AR[announcement.target_role]
  }

  if (announcement.target_type === "grade_level") {
    return announcement.grade_levels?.name ?? "صف غير معروف"
  }

  if (announcement.target_type === "class") {
    return announcement.classes?.name ?? "شعبة غير معروفة"
  }

  return ANNOUNCEMENT_TARGET_TYPE_LABELS_AR[announcement.target_type]
}

export default async function CommunicationAnnouncementsPage() {
  const contextResult = await requireCommunicationContext(communicationRoles)

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

  const announcements = await listAnnouncements(contextResult.data)
  const canManage =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعلانات"
        description="إعلانات مدرسية بسيطة موجهة للمدرسة أو دور أو صف أو شعبة."
        actions={
          canManage ? (
            <Link
              href={appRoutes.newCommunicationAnnouncement}
              className={buttonVariants({ size: "lg" })}
            >
              إعلان جديد
            </Link>
          ) : null
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="لا توجد إعلانات بعد"
          description="يمكن للإدارة إنشاء إعلان كمسودة ثم نشره عند الجاهزية."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="border-border/70 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription>
                      الجمهور: {formatTarget(announcement)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={ANNOUNCEMENT_STATUS_TONES[announcement.status]}>
                    {ANNOUNCEMENT_STATUS_LABELS_AR[announcement.status]}
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {announcement.body}
                </p>
                <p className="text-sm text-muted-foreground">
                  النشر: {formatDate(announcement.published_at)}
                </p>
                {canManage ? (
                  <AnnouncementActions announcementId={announcement.id} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
