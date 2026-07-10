"use client"

import { useActionState, useEffect, useEffectEvent, useRef, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Clock3, Lock, SendHorizontal } from "lucide-react"

import { ChatMessageList } from "@/components/chat/chat-message-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  markInternalConversationAsRead,
  sendInternalChatMessage,
  type InternalChatActionState,
} from "@/lib/chat/actions"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ChatComposerState, ChatMessageRecord } from "@/types/chat"

type RealtimeChatThreadProps = {
  title: string
  description: string
  phaseLabel: string
  note: string
  messages: ChatMessageRecord[]
  composer: ChatComposerState
  emptyTitle: string
  emptyDescription: string
  ariaLabel: string
  conversationId: string | null
}

const initialState: InternalChatActionState = null

function SubmitButton({
  disabled,
  disabledLabel,
  submitLabel,
}: {
  disabled: boolean
  disabledLabel: string
  submitLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={disabled || pending} className="rounded-2xl">
      <SendHorizontal className="size-4" />
      {pending
        ? "جاري الإرسال..."
        : disabled
          ? disabledLabel
          : submitLabel}
    </Button>
  )
}

export function RealtimeChatThread({
  title,
  description,
  phaseLabel,
  note,
  messages,
  composer,
  emptyTitle,
  emptyDescription,
  ariaLabel,
  conversationId,
}: RealtimeChatThreadProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [state, formAction] = useActionState(sendInternalChatMessage, initialState)
  const [isMarkingRead, startMarkReadTransition] = useTransition()
  const latestMessageId = messages[messages.length - 1]?.id ?? null

  const refreshConversation = useEffectEvent(() => {
    router.refresh()

    if (!conversationId) {
      return
    }

    startMarkReadTransition(() => {
      void markInternalConversationAsRead(conversationId)
    })
  })

  useEffect(() => {
    if (!conversationId || !latestMessageId) {
      return
    }

    startMarkReadTransition(() => {
      void markInternalConversationAsRead(conversationId)
    })
  }, [conversationId, latestMessageId])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel(`internal-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          refreshConversation()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    if (!state?.ok) {
      return
    }
    formRef.current?.reset()

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("conversation", state.data.conversationId)
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false })
    router.refresh()
  }, [pathname, router, searchParams, state])

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
          <form
            ref={formRef}
            key={conversationId ?? "new-conversation"}
            action={formAction}
            className="flex flex-col gap-3"
            noValidate
          >
            <input type="hidden" name="conversation_id" value={conversationId ?? ""} />
            <label htmlFor={ariaLabel} className="sr-only">
              {ariaLabel}
            </label>
            <Textarea
              id={ariaLabel}
              name="body"
              disabled={composer.disabled}
              placeholder={composer.placeholder}
              className="min-h-28 resize-none rounded-3xl border-border/70 bg-background"
            />

            {state?.ok === false ? (
              <Alert variant="destructive" className="border-destructive/25 bg-destructive/6">
                <AlertTitle>تعذر إرسال الرسالة</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                {composer.disabled ? (
                  <Lock className="mt-1 size-4 shrink-0" />
                ) : (
                  <Clock3 className="mt-1 size-4 shrink-0" />
                )}
                <p>
                  {composer.helperText}
                  {isMarkingRead ? " يتم تحديث حالة القراءة..." : ""}
                </p>
              </div>

              <SubmitButton
                disabled={composer.disabled}
                disabledLabel={composer.disabledLabel}
                submitLabel={composer.submitLabel}
              />
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
