import { ShieldAlert } from "lucide-react"

import { ChatLayout } from "@/components/chat/chat-layout"
import { RealtimeChatThread } from "@/components/chat/realtime-chat-thread"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { getPortalChatContext } from "@/lib/chat/access"
import { getPortalChatPageData } from "@/lib/chat/queries"

type PortalChatPageProps = {
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

export default async function PortalChatPage({
  searchParams,
}: PortalChatPageProps) {
  const contextResult = await getPortalChatContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="مراسلة المدرسة"
          description="تواصل مباشر مع إدارة المدرسة ضمن حسابك."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن فتح صفحة المراسلة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pageData = await getPortalChatPageData({
    context: contextResult.data,
    activeConversationId: getRequestedConversationId(
      resolvedSearchParams?.conversation
    ),
  })

  return (
    <PageShell>
      <PageHeader
        title="مراسلة المدرسة"
        description="تواصل مباشر مع إدارة المدرسة ضمن حسابك."
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
            ariaLabel="رسائل البوابة"
            conversationId={pageData.activeConversationId}
          />
        }
        className="xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]"
      />
    </PageShell>
  )
}
