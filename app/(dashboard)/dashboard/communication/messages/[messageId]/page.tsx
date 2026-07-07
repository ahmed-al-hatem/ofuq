import { notFound } from "next/navigation"
import { ShieldAlert } from "lucide-react"

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
import { requireCommunicationContext } from "@/lib/communication/context"
import { getMessageDetails } from "@/lib/communication/messages"
import { MessageReadArchiveForms } from "@/app/(dashboard)/dashboard/communication/_components/communication-forms"

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

export default async function CommunicationMessageDetailsPage({
  params,
}: {
  params: Promise<{ messageId: string }>
}) {
  const { messageId } = await params
  const contextResult = await requireCommunicationContext(messagingRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تفاصيل الرسالة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الرسالة"
          description={contextResult.error}
        />
      </div>
    )
  }

  let message

  try {
    message = await getMessageDetails(contextResult.data, messageId)
  } catch {
    notFound()
  }

  const currentRecipient = message.recipients.find(
    (recipient) => recipient.recipient_user_id === contextResult.data.user_id
  )
  const canUseRecipientActions = Boolean(currentRecipient)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={message.subject}
        description={`أرسلت في ${formatDate(message.sent_at)} بواسطة ${
          message.sender?.full_name ?? "مستخدم"
        }`}
        actions={
          canUseRecipientActions ? (
            <MessageReadArchiveForms
              messageId={message.id}
              canMarkRead={!currentRecipient?.read_at}
            />
          ) : null
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>نص الرسالة</CardTitle>
          <CardDescription>
            لا توجد مرفقات أو تسليم خارجي في هذه المرحلة.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="whitespace-pre-wrap text-sm leading-7">{message.body}</p>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm font-medium">المستلمون</p>
            <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
              {message.recipients.map((recipient) => (
                <span key={recipient.id}>
                  {recipient.recipient?.full_name ?? "مستخدم"} -{" "}
                  {recipient.read_at ? "مقروءة" : "غير مقروءة"}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
