import { ShieldAlert } from "lucide-react"

import { AssistantPromptPanel } from "@/components/chat/assistant-prompt-panel"
import { AssistantThread } from "@/components/chat/assistant-thread"
import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { getPortalAssistantContext } from "@/lib/assistant/policies"
import { getPortalAssistantPageData } from "@/lib/assistant/queries"

type PortalAssistantPageProps = {
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

export default async function PortalAssistantPage({
  searchParams,
}: PortalAssistantPageProps) {
  const contextResult = await getPortalAssistantContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="مساعد أُفُق"
          description="اسأل عن الحضور والدرجات والمالية ضمن بياناتك المسموح بها."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن فتح صفحة المساعد"
          description={contextResult.error}
        />
      </div>
    )
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pageData = await getPortalAssistantPageData({
    context: contextResult.data,
    activeConversationId: getRequestedConversationId(
      resolvedSearchParams?.conversation
    ),
  })

  if (pageData.status === "restricted") {
    return (
      <PageShell>
        <PageHeader
          title="مساعد أُفُق"
          description="اسأل عن الحضور والدرجات والمالية ضمن بياناتك المسموح بها."
          actions={<StatusBadge status="warning">وصول مقيد</StatusBadge>}
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
        title="مساعد أُفُق"
        description="اسأل عن الحضور والدرجات والمالية ضمن بياناتك المسموح بها."
        actions={
          <StatusBadge
            status={
              pageData.runtimeStatus === "configured" ? "success" : "warning"
            }
          >
            {pageData.runtimeStatus === "configured"
              ? "Gemini MVP"
              : "تهيئة Gemini مطلوبة"}
          </StatusBadge>
        }
      />

      <ChatLayout
        sidebar={
          <ChatSidebar
            title={pageData.sidebarTitle}
            description={pageData.sidebarDescription}
            conversations={pageData.conversations}
            activeConversationId={pageData.activeConversationId}
            emptyDescription={pageData.sidebarEmptyDescription}
          />
        }
        main={
          <div className="flex flex-col gap-4">
            <AssistantPromptPanel prompts={pageData.prompts} />
            <AssistantThread
              title={pageData.threadTitle}
              description={pageData.threadDescription}
              phaseLabel={pageData.phaseLabel}
              note={pageData.note}
              messages={pageData.messages}
              composer={pageData.composer}
              emptyTitle={pageData.emptyStateTitle}
              emptyDescription={pageData.emptyStateDescription}
              ariaLabel="محادثة المساعد للبوابة"
              conversationId={pageData.activeConversationId}
              setupMessage={pageData.setupMessage}
            />
          </div>
        }
        className="xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]"
      />
    </PageShell>
  )
}
