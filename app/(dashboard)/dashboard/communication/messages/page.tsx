import Link from "next/link"
import { Inbox, Send, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { FormSheet } from "@/components/shared/form-sheet"
import { PageHeader } from "@/components/shared/page-header"
import { PageSection } from "@/components/shared/page-section"
import { PageShell } from "@/components/shared/page-shell"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SheetClose } from "@/components/ui/sheet"
import { USER_ROLES } from "@/constants/roles"
import { appRoutes } from "@/constants/routes"
import { requireCommunicationContext } from "@/lib/communication/context"
import {
  listInboxMessages,
  listMessageRecipientOptions,
  listSentMessages,
} from "@/lib/communication/messages"
import { listStudents } from "@/lib/students/students"
import { MessageForm } from "../_components/communication-forms"

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

  const [inboxMessages, sentMessages, recipients, students] = await Promise.all([
    listInboxMessages(contextResult.data),
    listSentMessages(contextResult.data),
    listMessageRecipientOptions(contextResult.data),
    listStudents(contextResult.data),
  ])

  return (
    <PageShell>
      <PageHeader
        title="الرسائل"
        description="وارد ومرسل داخلي بين مستخدمي المدرسة. لا توجد محادثة فورية أو تسليم خارجي في هذه المرحلة."
        actions={
          <>
            <FormSheet
              trigger={<Button size="lg" />}
              triggerLabel="رسالة جديدة"
              title="إرسال رسالة"
              description="أرسل رسالة داخلية من الصفحة الحالية، أو افتح الصفحة الكاملة إذا كنت تحتاج مساحة عمل أكبر."
              width="xl"
            >
              <MessageForm
                recipients={recipients}
                students={students}
                surface="plain"
                cancelSlot={
                  <SheetClose render={<Button variant="outline" type="button" />}>
                    إلغاء
                  </SheetClose>
                }
              />
            </FormSheet>
            <Link
              href={appRoutes.newCommunicationMessage}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              فتح الصفحة الكاملة
            </Link>
          </>
        }
      />

      <PageSection
        title="الوارد والمرسل"
        description="تظل تفاصيل الرسائل في صفحات مستقلة، بينما أصبح الإرسال السريع متاحًا مباشرة من هنا."
        contentClassName="grid gap-4 xl:grid-cols-2"
      >
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
              <EmptyState
                icon={Inbox}
                title="لا توجد رسائل واردة"
                description="ستظهر الرسائل الجديدة هنا فور وصولها إلى حسابك."
                size="compact"
                className="bg-transparent shadow-none"
              />
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
              <EmptyState
                icon={Send}
                title="لا توجد رسائل مرسلة"
                description="أرسل أول رسالة داخلية من الزر أعلاه لتظهر هنا ضمن السجل."
                size="compact"
                className="bg-transparent shadow-none"
              />
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
      </PageSection>
    </PageShell>
  )
}
