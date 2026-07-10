import { ShieldAlert } from "lucide-react"

import { ChatLayout } from "@/components/chat/chat-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatThread } from "@/components/chat/chat-thread"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buildDashboardChatScaffold } from "@/lib/chat/presenters"
import { getAuthenticatedUser } from "@/lib/auth/session"

export default async function DashboardChatPage() {
  const user = await getAuthenticatedUser()

  if (!user || !user.role) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="المحادثات الداخلية"
          description="متابعة رسائل أولياء الأمور والطلاب ضمن المدرسة الحالية."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن تحميل واجهة المحادثات"
          description="تعذر تحديد العضوية الحالية اللازمة لعرض واجهة المحادثات الداخلية."
        />
      </div>
    )
  }

  const scaffold = buildDashboardChatScaffold(user)

  return (
    <PageShell>
      <PageHeader
        title="المحادثات الداخلية"
        description="متابعة رسائل أولياء الأمور والطلاب ضمن المدرسة الحالية."
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
            ariaLabel="قائمة الرسائل الداخلية"
          />
        }
      />
    </PageShell>
  )
}
