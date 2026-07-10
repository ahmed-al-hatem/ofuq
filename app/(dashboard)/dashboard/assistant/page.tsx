import { ShieldAlert } from "lucide-react"

import { AssistantPromptPanel } from "@/components/chat/assistant-prompt-panel"
import { AssistantThread } from "@/components/chat/assistant-thread"
import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getDashboardAssistantContext,
} from "@/lib/assistant/policies"
import { getDashboardAssistantPageData } from "@/lib/assistant/queries"

type DashboardAssistantPageProps = {
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

export default async function DashboardAssistantPage({
  searchParams,
}: DashboardAssistantPageProps) {
  const contextResult = await getDashboardAssistantContext()

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="مساعد أُفُق"
          description="مساعد ذكي لقراءة ملخصات المدرسة حسب الصلاحيات."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن تحميل واجهة المساعد"
          description={contextResult.error}
        />
      </div>
    )
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pageData = await getDashboardAssistantPageData({
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
          description="مساعد ذكي لقراءة ملخصات المدرسة حسب الصلاحيات."
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
        description="مساعد ذكي لقراءة ملخصات المدرسة حسب الصلاحيات."
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
              ariaLabel="محادثة المساعد للوحة التحكم"
              conversationId={pageData.activeConversationId}
              setupMessage={pageData.setupMessage}
            />
          </div>
        }
      />
    </PageShell>
  )
}
