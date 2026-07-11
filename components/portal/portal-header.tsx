import Image from "next/image"
import { LogOut } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { appConfig } from "@/config/app"
import { signOutFromForm } from "@/lib/actions/auth"
import { getRoleLabel } from "@/lib/auth/session"
import type { PortalSessionUser } from "@/types/portal"

export function PortalHeader({ user }: Readonly<{ user: PortalSessionUser }>) {
  const roleLabel = getRoleLabel(user.role)
  const displayName = user.display_name ?? user.full_name ?? "مستخدم البوابة"
  const email = user.email ?? "حساب المدرسة"

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
            <Image
              src="/logo.png"
              alt={`${appConfig.name} ${appConfig.arabicName}`}
              width={40}
              height={40}
              className="size-full object-contain"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-foreground">
              {appConfig.name} | {appConfig.arabicName}
            </span>
            <span className="truncate text-sm text-muted-foreground sm:text-base">
              بوابة ولي الأمر والطالب
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <Badge variant="secondary" className="h-6 rounded-full px-2.5 text-[11px]">
            {roleLabel}
          </Badge>
          <div className="min-w-0 rounded-full border border-border/70 bg-muted/35 px-3 py-1.5">
            <div className="flex min-w-0 flex-col items-end leading-tight">
              <span className="max-w-28 truncate text-xs font-medium text-foreground sm:max-w-40 sm:text-sm">
                {displayName}
              </span>
              <span className="max-w-32 truncate text-[11px] text-muted-foreground sm:max-w-44">
                {email}
              </span>
            </div>
          </div>
          <form action={signOutFromForm}>
            <Button type="submit" variant="outline" size="sm" className="rounded-full">
              <LogOut data-icon="inline-start" />
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
