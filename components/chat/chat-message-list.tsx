import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import type { ChatMessageRecord } from "@/types/chat"

import { ChatEmptyState } from "@/components/chat/chat-empty-state"
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble"

type ChatMessageListProps = {
  messages: ChatMessageRecord[]
  emptyTitle: string
  emptyDescription: string
  ariaLabel: string
}

export function ChatMessageList({
  messages,
  emptyTitle,
  emptyDescription,
  ariaLabel,
}: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <ChatEmptyState title={emptyTitle} description={emptyDescription} className="m-5" />
    )
  }

  return (
    <MessageScrollerProvider defaultScrollPosition="end" scrollMargin={24}>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport aria-label={ariaLabel} className="px-4 py-5 sm:px-5">
          <MessageScrollerContent className="gap-5">
            {messages.map((message, index) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={index === messages.length - 1}
              >
                <ChatMessageBubble message={message} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="end" className="shadow-lg" />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
