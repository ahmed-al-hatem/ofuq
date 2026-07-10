import { Bot, MessageSquareMore } from "lucide-react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import { cn } from "@/lib/utils"
import type { ChatMessageRecord } from "@/types/chat"
import { formatChatTimestamp } from "@/lib/chat/presenters"

type ChatMessageBubbleProps = {
  message: ChatMessageRecord
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)

  if (parts.length === 0) {
    return "؟"
  }

  return parts.slice(0, 2).map((part) => part[0]).join("")
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const align = message.variant === "current-user" ? "end" : "start"
  const bubbleVariant =
    message.variant === "current-user"
      ? "default"
      : message.variant === "assistant"
        ? "tinted"
        : message.variant === "system"
          ? "outline"
          : "outline"

  return (
    <Message align={align}>
      <MessageAvatar
        className={cn(
          "size-10 rounded-2xl border border-border/60 text-[0.7rem] font-semibold shadow-sm",
          message.variant === "current-user" &&
            "bg-primary text-primary-foreground",
          message.variant === "assistant" && "bg-secondary/15 text-secondary",
          message.variant === "system" && "bg-accent/15 text-accent-foreground",
          message.variant === "participant" && "bg-background text-foreground"
        )}
      >
        {message.variant === "assistant" ? (
          <Bot className="size-4" />
        ) : message.variant === "system" ? (
          <MessageSquareMore className="size-4" />
        ) : (
          <span>{getInitials(message.authorName)}</span>
        )}
      </MessageAvatar>

      <MessageContent>
        <MessageHeader className="gap-2 px-1 text-[0.7rem]">
          <span className="font-semibold text-foreground">{message.authorName}</span>
          {message.authorRoleLabel ? <span>{message.authorRoleLabel}</span> : null}
          <span>{formatChatTimestamp(message.createdAt)}</span>
        </MessageHeader>

        <Bubble align={align} variant={bubbleVariant} className="max-w-[92%]">
          <BubbleContent className="rounded-3xl px-4 py-3 text-sm leading-7">
            {message.body}
          </BubbleContent>
        </Bubble>

        {message.meta ? (
          <MessageFooter className="px-1 text-[0.7rem]">{message.meta}</MessageFooter>
        ) : null}
      </MessageContent>
    </Message>
  )
}
