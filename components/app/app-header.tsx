import { LogOut, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { appConfig } from "@/config/app"
import { signOutFromForm } from "@/lib/actions/auth"
import { getRoleLabel } from "@/lib/auth/session"
import type { SessionUser } from "@/types/auth"

export function AppHeader({ user }: Readonly<{ user: SessionUser }>) {
  const roleLabel = user.role ? getRoleLabel(user.role) : "بدون عضوية نشطة"

  return (
    <header className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.name}
              </p>
              <p className="text-base font-semibold">{appConfig.arabicName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium">
                {user.display_name ?? user.full_name}
              </span>
              <span className="text-muted-foreground">{user.email ?? "حساب المدرسة"}</span>
            </div>
            <form action={signOutFromForm}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut data-icon="inline-start" />
                تسجيل الخروج
              </Button>
            </form>
          </div>
        </div>

        <Separator />

        <p className="text-sm leading-6 text-muted-foreground">
          تابع أعمالك اليومية من مكان واحد داخل منصة أُفُق.
        </p>
      </div>
    </header>
  )
}
