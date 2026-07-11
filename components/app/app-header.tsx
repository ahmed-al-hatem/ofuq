import { LogOut } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { signOutFromForm } from "@/lib/actions/auth"
import { getRoleLabel } from "@/lib/auth/session"
import type { SessionUser } from "@/types/auth"

export function AppHeader({ user }: Readonly<{ user: SessionUser }>) {
  const roleLabel = user.role ? getRoleLabel(user.role) : "بدون عضوية نشطة"
  const displayName = user.display_name ?? user.full_name ?? "مستخدم المدرسة"
  const email = user.email ?? "حساب المدرسة"

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-[4.5rem] w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-muted-foreground">مساحة التشغيل</p>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5">
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[11px]">
              {roleLabel}
            </Badge>
            <div className="flex min-w-0 flex-col items-end leading-tight">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="max-w-40 truncate text-xs text-muted-foreground sm:max-w-56">
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
