"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { appConfig } from "@/config/app"
import { appRoutes } from "@/constants/routes"
import { getDashboardNavigationForRole } from "@/lib/navigation/role-navigation"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/types/auth"

export function AppSidebar({ user }: Readonly<{ user: SessionUser }>) {
  const pathname = usePathname()
  const navigation = user.role ? getDashboardNavigationForRole(user.role) : []

  return (
    <aside className="border-b border-sidebar-border bg-sidebar/95 text-sidebar-foreground lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-5 lg:py-5">
        <Link
          href={appRoutes.home}
          className="flex h-16 items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-sidebar-accent/40"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-base font-semibold">أ</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-muted-foreground">
              {appConfig.name}
            </span>
            <span className="text-base font-semibold text-sidebar-foreground">
              {appConfig.arabicName}
            </span>
          </div>
        </Link>

        <nav className="flex flex-col gap-3">
          {navigation.map((group) => (
            <div key={group.label || "root"} className="flex flex-col gap-1.5">
              {group.label ? (
                <p className="px-3 pt-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground">
                  {group.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  if (!item.href) {
                    return null
                  }

                  const Icon = item.icon
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-10 justify-start gap-3 rounded-xl px-3 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/95 hover:text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon data-icon="inline-start" />
                      <span className="flex-1 text-start">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-dashed border-sidebar-border bg-background/50 p-4">
          <p className="text-sm font-medium">تنظيم يومك الدراسي يبدأ من هنا</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            استخدم الاختصارات والملخصات للوصول إلى المهام الأكثر تكرارًا بسرعة.
          </p>
        </div>
      </div>
    </aside>
  )
}
