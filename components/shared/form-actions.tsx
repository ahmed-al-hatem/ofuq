"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"
import type { VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
type ButtonSize = VariantProps<typeof buttonVariants>["size"]

type FormActionsProps = {
  submitLabel?: string
  pendingLabel?: string
  cancelSlot?: ReactNode
  disabled?: boolean
  destructive?: boolean
  submitVariant?: ButtonVariant
  submitSize?: ButtonSize
  className?: string
}

export function FormActions({
  submitLabel = "حفظ",
  pendingLabel = "جاري الحفظ...",
  cancelSlot,
  disabled = false,
  destructive = false,
  submitVariant,
  submitSize = "lg",
  className,
}: FormActionsProps) {
  const { pending } = useFormStatus()
  const isDisabled = disabled || pending

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end",
        className
      )}
    >
      {cancelSlot}
      <Button
        type="submit"
        size={submitSize}
        variant={submitVariant ?? (destructive ? "destructive" : "default")}
        disabled={isDisabled}
      >
        {pending ? pendingLabel : submitLabel}
      </Button>
    </div>
  )
}
