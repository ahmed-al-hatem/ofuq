import { ShieldAlert } from "lucide-react"

import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatThread } from "@/components/chat/chat-thread"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buildPortalChatScaffold } from "@/lib/chat/presenters"
import { requirePortalContext } from "@/lib/portal/context"

export default async function PortalChatPage() {
  const contextResult = await requirePortalContext()

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

  const scaffold = buildPortalChatScaffold(contextResult.data)

  return (
    <PageShell>
      <PageHeader
        title="مراسلة المدرسة"
        description="تواصل مباشر مع إدارة المدرسة ضمن حسابك."
        actions={<StatusBadge status="info">تهيئة Phase 25A</StatusBadge>}
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
          <ChatThread
            title={scaffold.threadTitle}
            description={scaffold.threadDescription}
            phaseLabel={scaffold.phaseLabel}
            note={scaffold.note}
            messages={scaffold.messages}
            composer={scaffold.composer}
            emptyTitle={scaffold.emptyStateTitle}
            emptyDescription={scaffold.emptyStateDescription}
            ariaLabel="رسائل البوابة"
          />
        }
        className="xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]"
      />
    </PageShell>
  )
}
