"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Clock3, Lock, SendHorizontal, Wrench } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { askOfuqAssistant, type AssistantActionState } from "@/lib/assistant/actions"
import type { ChatComposerState } from "@/types/chat"

type AssistantComposerProps = {
  conversationId: string | null
  composer: ChatComposerState
  ariaLabel: string
  setupMessage?: string | null
}

const initialState: AssistantActionState = null

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
      {pending ? "جارٍ تجهيز الرد..." : disabled ? disabledLabel : submitLabel}
    </Button>
  )
}

export function AssistantComposer({
  conversationId,
  composer,
  ariaLabel,
  setupMessage,
}: AssistantComposerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [state, formAction] = useActionState(askOfuqAssistant, initialState)

  useEffect(() => {
    if (!state?.ok) {
      return
    }

    formRef.current?.reset()

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("conversation", state.data.conversationId)
    const nextQuery = nextSearchParams.toString()

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
    router.refresh()
  }, [pathname, router, searchParams, state])

  return (
    <form
      ref={formRef}
      key={conversationId ?? "new-assistant-conversation"}
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
        name="message"
        disabled={composer.disabled}
        placeholder={composer.placeholder}
        className="min-h-28 resize-none rounded-3xl border-border/70 bg-background"
      />

      {setupMessage ? (
        <Alert className="border-border/70 bg-muted/20">
          <Wrench className="size-4" />
          <AlertTitle>تفعيل Gemini مطلوب</AlertTitle>
          <AlertDescription>{setupMessage}</AlertDescription>
        </Alert>
      ) : null}

      {state?.ok === false ? (
        <Alert variant="destructive" className="border-destructive/25 bg-destructive/6">
          <AlertTitle>تعذر الحصول على رد</AlertTitle>
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
          <p>{composer.helperText}</p>
        </div>

        <SubmitButton
          disabled={composer.disabled}
          disabledLabel={composer.disabledLabel}
          submitLabel={composer.submitLabel}
        />
      </div>
    </form>
  )
}
