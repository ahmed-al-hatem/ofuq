import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChatComposerState, ChatMessageRecord } from "@/types/chat"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatMessageList } from "@/components/chat/chat-message-list"

type ChatThreadProps = {
  title: string
  description: string
  phaseLabel: string
  note: string
  messages: ChatMessageRecord[]
  composer: ChatComposerState
  emptyTitle: string
  emptyDescription: string
  ariaLabel: string
}

export function ChatThread({
  title,
  description,
  phaseLabel,
  note,
  messages,
  composer,
  emptyTitle,
  emptyDescription,
  ariaLabel,
}: ChatThreadProps) {
  return (
    <Card className="flex min-h-[42rem] flex-col overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-3 border-b border-border/60 bg-muted/10">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {phaseLabel}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
        <p className="text-sm leading-6 text-muted-foreground">{note}</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <ChatMessageList
          messages={messages}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          ariaLabel={ariaLabel}
        />
        <div className="border-t border-border/60 bg-background/95 p-4 sm:p-5">
          <ChatComposer composer={composer} ariaLabel={`${ariaLabel}-composer`} />
        </div>
      </CardContent>
    </Card>
  )
}
