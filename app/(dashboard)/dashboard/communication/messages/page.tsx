import Link from "next/link"
import { Inbox, Send, ShieldAlert } from "lucide-react"

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
import { requireCommunicationContext } from "@/lib/communication/context"
import {
  listInboxMessages,
  listSentMessages,
} from "@/lib/communication/messages"

const messagingRoles = [
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

export default async function CommunicationMessagesPage() {
  const contextResult = await requireCommunicationContext(messagingRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الرسائل" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الرسائل"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [inboxMessages, sentMessages] = await Promise.all([
    listInboxMessages(contextResult.data),
    listSentMessages(contextResult.data),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الرسائل"
        description="وارد ومرسل داخلي بين مستخدمي المدرسة. لا توجد محادثة فورية أو تسليم خارجي في هذه المرحلة."
        actions={
          <Link
            href={appRoutes.newCommunicationMessage}
            className={buttonVariants({ size: "lg" })}
          >
            رسالة جديدة
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="size-5" />
              الوارد
            </CardTitle>
            <CardDescription>رسائل وصلت إلى حسابك الحالي.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {inboxMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد رسائل واردة.</p>
            ) : (
              inboxMessages.map((recipient) =>
                recipient.messages ? (
                  <Link
                    key={recipient.id}
                    href={appRoutes.communicationMessageDetails(recipient.message_id)}
                    className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                  >
                    <p className="font-medium">{recipient.messages.subject}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      من {recipient.messages.sender?.full_name ?? "مستخدم"} -{" "}
                      {formatDate(recipient.messages.sent_at)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {recipient.read_at ? "مقروءة" : "غير مقروءة"}
                    </p>
                  </Link>
                ) : null
              )
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="size-5" />
              المرسل
            </CardTitle>
            <CardDescription>الرسائل التي أرسلتها من حسابك.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {sentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد رسائل مرسلة.</p>
            ) : (
              sentMessages.map((message) => (
                <Link
                  key={message.id}
                  href={appRoutes.communicationMessageDetails(message.id)}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="font-medium">{message.subject}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {message.recipients.length} مستلم - {formatDate(message.sent_at)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
