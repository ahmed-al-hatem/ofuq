"use client"

import type { ReactElement, ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type FormSheetProps = {
  trigger: ReactElement
  triggerLabel: ReactNode
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
  triggerNativeButton?: boolean
  side?: "top" | "right" | "bottom" | "left"
  width?: "md" | "lg" | "xl"
}

const sheetWidthClasses = {
  md: "data-[side=right]:sm:max-w-xl data-[side=left]:sm:max-w-xl",
  lg: "data-[side=right]:sm:max-w-2xl data-[side=left]:sm:max-w-2xl",
  xl: "data-[side=right]:sm:max-w-3xl data-[side=left]:sm:max-w-3xl",
} as const

export function FormSheet({
  trigger,
  triggerLabel,
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
  triggerNativeButton,
  side = "right",
  width = "lg",
}: FormSheetProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={trigger}
        nativeButton={triggerNativeButton}
      >
        {triggerLabel}
      </SheetTrigger>
      <SheetContent
        side={side}
        className={cn(
          "gap-0 p-0",
          sheetWidthClasses[width],
          contentClassName
        )}
      >
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5",
            bodyClassName
          )}
        >
          {children}
        </div>
        {footer ? (
          <SheetFooter className="border-t border-border/60">
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
