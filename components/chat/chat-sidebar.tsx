import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ChatConversationPreview } from "@/types/chat"
import { formatChatTimestamp } from "@/lib/chat/presenters"

type ChatSidebarProps = {
  title: string
  description: string
  conversations: ChatConversationPreview[]
  activeConversationId: string | null
  emptyDescription?: string
}

export function ChatSidebar({
  title,
  description,
  conversations,
  activeConversationId,
  emptyDescription = "ستظهر المحادثات هنا فور بدء المراسلات داخل المدرسة الحالية.",
}: ChatSidebarProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant="outline" className="rounded-full">
            {conversations.length}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4">
        {conversations.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-sm leading-6 text-muted-foreground">
            {emptyDescription}
          </div>
        ) : null}

        {conversations.map((conversation) => {
          const active = conversation.id === activeConversationId
          const content = (
            <div
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-[1.5rem] border px-4 py-4 transition-colors",
                active
                  ? "border-primary/20 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-background hover:border-primary/15 hover:bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {conversation.title}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {conversation.participantLabel}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={active ? "default" : "outline"} className="rounded-full">
                    {conversation.statusLabel}
                  </Badge>
                  {conversation.unreadCount > 0 ? (
                    <Badge variant="secondary" className="rounded-full">
                      {conversation.unreadCount}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {conversation.excerpt}
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                {formatChatTimestamp(conversation.lastMessageAt)}
              </p>
            </div>
          )

          if (!conversation.href) {
            return <div key={conversation.id}>{content}</div>
          }

          return (
            <Link key={conversation.id} href={conversation.href} className="block">
              {content}
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
