"use client"

import type { ReactElement, ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type FormDialogProps = {
  trigger: ReactElement
  triggerLabel: ReactNode
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
  triggerNativeButton?: boolean
  size?: "md" | "lg" | "xl"
}

const dialogSizeClasses = {
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
} as const

export function FormDialog({
  trigger,
  triggerLabel,
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
  triggerNativeButton,
  size = "lg",
}: FormDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={trigger}
        nativeButton={triggerNativeButton}
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(92vh,52rem)] gap-0 overflow-hidden p-0",
          dialogSizeClasses[size],
          contentClassName
        )}
      >
        <DialogHeader className="border-b border-border/60 px-5 py-4 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div
          className={cn(
            "overflow-y-auto px-5 py-4 sm:px-6 sm:py-5",
            bodyClassName
          )}
        >
          {children}
        </div>
        {footer ? (
          <DialogFooter className="border-t border-border/60 px-5 py-4 sm:px-6">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
