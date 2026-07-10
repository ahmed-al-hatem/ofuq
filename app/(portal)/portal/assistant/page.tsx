import { ShieldAlert } from "lucide-react"

import { AssistantPromptPanel } from "@/components/chat/assistant-prompt-panel"
import { AssistantThread } from "@/components/chat/assistant-thread"
import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buildPortalAssistantScaffold } from "@/lib/chat/presenters"
import { requirePortalContext } from "@/lib/portal/context"

export default async function PortalAssistantPage() {
  const contextResult = await requirePortalContext()

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

  const scaffold = buildPortalAssistantScaffold(contextResult.data)

  return (
    <PageShell>
      <PageHeader
        title="مساعد أُفُق"
        description="اسأل عن الحضور والدرجات والمالية ضمن بياناتك المسموح بها."
        actions={<StatusBadge status="info">Gemini لاحقًا</StatusBadge>}
      />

      <ChatLayout
        sidebar={
          <ChatSidebar
            title={scaffold.sidebarTitle}
            description={scaffold.sidebarDescription}
            conversations={scaffold.conversations}
            activeConversationId={scaffold.activeConversationId}
          />
        }
        main={
          <div className="flex flex-col gap-4">
            <AssistantPromptPanel prompts={scaffold.prompts} />
            <AssistantThread
              title={scaffold.threadTitle}
              description={scaffold.threadDescription}
              phaseLabel={scaffold.phaseLabel}
              note={scaffold.note}
              messages={scaffold.messages}
              composer={scaffold.composer}
              emptyTitle={scaffold.emptyStateTitle}
              emptyDescription={scaffold.emptyStateDescription}
              ariaLabel="محادثة المساعد للبوابة"
            />
          </div>
        }
        className="xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]"
      />
    </PageShell>
  )
}
