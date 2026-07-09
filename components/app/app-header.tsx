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
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.name}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold">{appConfig.arabicName}</p>
                  <Badge variant="outline" className="rounded-full">
                    مساحة التشغيل
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {roleLabel}
              </Badge>
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-2 text-sm">
                <div className="flex flex-col items-end">
                  <span className="font-medium">
                    {user.display_name ?? user.full_name}
                  </span>
                  <span className="text-muted-foreground">
                    {user.email ?? "حساب المدرسة"}
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

          <Separator />

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              إدارة المدرسة اليومية من واجهة عربية واضحة ومباشرة.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              تابع الملخصات والتنبيهات والوحدات المتاحة لدورك الحالي من مكان واحد.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
