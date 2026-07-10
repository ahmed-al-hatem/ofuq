import { ShieldAlert } from "lucide-react"

import { ChatLayout } from "@/components/chat/chat-layout"
import { RealtimeChatThread } from "@/components/chat/realtime-chat-thread"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { getDashboardChatContext } from "@/lib/chat/access"
import { getDashboardChatPageData } from "@/lib/chat/queries"

type DashboardChatPageProps = {
  searchParams?: Promise<{
    conversation?: string | string[]
  }>
}

function getRequestedConversationId(
  conversation: string | string[] | undefined
): string | null {
  if (Array.isArray(conversation)) {
    return conversation[0] ?? null
  }

  return conversation ?? null
}

export default async function DashboardChatPage({
  searchParams,
}: DashboardChatPageProps) {
  const contextResult = await getDashboardChatContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="المحادثات الداخلية"
          description="متابعة رسائل أولياء الأمور والطلاب ضمن المدرسة الحالية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن تحميل واجهة المحادثات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pageData = await getDashboardChatPageData({
    context: contextResult.data,
    activeConversationId: getRequestedConversationId(
      resolvedSearchParams?.conversation
    ),
  })

  if (pageData.status === "restricted") {
    return (
      <PageShell>
        <PageHeader
          title="المحادثات الداخلية"
          description="متابعة رسائل أولياء الأمور والطلاب ضمن المدرسة الحالية."
          actions={<StatusBadge status="info">مقيد حسب الدور</StatusBadge>}
        />
        <EmptyState
          icon={ShieldAlert}
          title={pageData.title}
          description={pageData.description}
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="المحادثات الداخلية"
        description="متابعة رسائل أولياء الأمور والطلاب ضمن المدرسة الحالية."
        actions={<StatusBadge status="success">Realtime MVP</StatusBadge>}
      />

      <ChatLayout
        sidebar={
          <ChatSidebar
            title={pageData.sidebarTitle}
            description={pageData.sidebarDescription}
            conversations={pageData.conversations}
            activeConversationId={pageData.activeConversationId}
          />
        }
        main={
          <RealtimeChatThread
            title={pageData.threadTitle}
            description={pageData.threadDescription}
            phaseLabel={pageData.phaseLabel}
            note={pageData.note}
            messages={pageData.messages}
            composer={pageData.composer}
            emptyTitle={pageData.emptyStateTitle}
            emptyDescription={pageData.emptyStateDescription}
            ariaLabel="قائمة الرسائل الداخلية"
            conversationId={pageData.activeConversationId}
          />
        }
      />
    </PageShell>
  )
}
