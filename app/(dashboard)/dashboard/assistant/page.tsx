import { ShieldAlert } from "lucide-react"

import { AssistantPromptPanel } from "@/components/chat/assistant-prompt-panel"
import { AssistantThread } from "@/components/chat/assistant-thread"
import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buildDashboardAssistantScaffold } from "@/lib/chat/presenters"
import { getAuthenticatedUser } from "@/lib/auth/session"

export default async function DashboardAssistantPage() {
  const user = await getAuthenticatedUser()

  if (!user || !user.role) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="مساعد أُفُق"
          description="مساعد ذكي لقراءة ملخصات المدرسة حسب الصلاحيات."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن تحميل واجهة المساعد"
          description="تعذر تحديد العضوية الحالية اللازمة لعرض مساعد أُفُق."
        />
      </div>
    )
  }

  const scaffold = buildDashboardAssistantScaffold(user)

  return (
    <PageShell>
      <PageHeader
        title="مساعد أُفُق"
        description="مساعد ذكي لقراءة ملخصات المدرسة حسب الصلاحيات."
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
              ariaLabel="محادثة المساعد للوحة التحكم"
            />
          </div>
        }
      />
    </PageShell>
  )
}
