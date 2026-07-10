import { Clock3, Lock, SendHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ChatComposerState } from "@/types/chat"

type ChatComposerProps = {
  composer: ChatComposerState
  ariaLabel: string
}

export function ChatComposer({ composer, ariaLabel }: ChatComposerProps) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={ariaLabel} className="sr-only">
        {ariaLabel}
      </label>
      <Textarea
        id={ariaLabel}
        value=""
        readOnly
        disabled={composer.disabled}
        placeholder={composer.placeholder}
        className="min-h-28 resize-none rounded-3xl border-border/70 bg-background"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
          {composer.disabled ? (
            <Lock className="mt-1 size-4 shrink-0" />
          ) : (
            <Clock3 className="mt-1 size-4 shrink-0" />
          )}
          <p>{composer.helperText}</p>
        </div>
        <Button type="button" disabled={composer.disabled} className="rounded-2xl">
          <SendHorizontal className="size-4" />
          {composer.disabled ? composer.disabledLabel : composer.submitLabel}
        </Button>
      </div>
    </div>
  )
}
