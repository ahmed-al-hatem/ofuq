import Link from "next/link"
import {
  Bell,
  CalendarDays,
  Megaphone,
  MessageSquareMore,
  ShieldAlert,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
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
import { listAnnouncements } from "@/lib/communication/announcements"
import { requireCommunicationContext } from "@/lib/communication/context"
import { listSchoolEvents } from "@/lib/communication/events"
import { listInboxMessages } from "@/lib/communication/messages"
import { listNotificationLogs } from "@/lib/communication/notifications"

const communicationRoles = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.LIBRARIAN,
] as const

export default async function CommunicationOverviewPage() {
  const contextResult = await requireCommunicationContext(communicationRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="التواصل"
          description="رسائل داخلية وإعلانات وأحداث وإشعارات داخل التطبيق."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى وحدة التواصل"
          description={contextResult.error}
        />
      </div>
    )
  }

  const isAdmin =
    contextResult.data.role === USER_ROLES.SYSTEM_ADMIN ||
    contextResult.data.role === USER_ROLES.SCHOOL_ADMIN
  const [inboxMessages, announcements, events, notifications] =
    await Promise.all([
      listInboxMessages(contextResult.data, 5),
      listAnnouncements(contextResult.data, 5),
      listSchoolEvents(contextResult.data, 5),
      listNotificationLogs(contextResult.data, isAdmin, 5),
    ])

  const cards = [
    {
      title: "الرسائل",
      description: `${inboxMessages.length} رسالة حديثة في الوارد`,
      href: appRoutes.communicationMessages,
      icon: MessageSquareMore,
    },
    {
      title: "الإعلانات",
      description: `${announcements.length} إعلان حديث`,
      href: appRoutes.communicationAnnouncements,
      icon: Megaphone,
    },
    {
      title: "الأحداث",
      description: `${events.length} حدث مدرسي حديث أو قادم`,
      href: appRoutes.communicationEvents,
      icon: CalendarDays,
    },
    {
      title: "الإشعارات",
      description: `${notifications.length} إشعار داخل التطبيق`,
      href: appRoutes.communicationNotifications,
      icon: Bell,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التواصل"
        description="أساس عملي للتواصل المدرسي الداخلي دون بريد أو رسائل SMS أو تكاملات خارجية."
        actions={
          <Link
            href={appRoutes.newCommunicationMessage}
            className={buttonVariants({ size: "lg" })}
          >
            رسالة جديدة
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح الصفحة
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
