"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { appConfig } from "@/config/app"
import { portalNavigation } from "@/config/portal-navigation"
import { appRoutes } from "@/constants/routes"
import { cn } from "@/lib/utils"

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b bg-sidebar text-sidebar-foreground lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-5">
        <div className="flex flex-col gap-3 rounded-[1.75rem] border border-sidebar-border bg-background/60 p-4 shadow-sm">
          <Link href={appRoutes.home} className="block">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <span className="text-base font-semibold">أ</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.name}
                </p>
                <h2 className="text-lg font-semibold">{appConfig.arabicName}</h2>
              </div>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="w-fit rounded-full">
              بوابة المتابعة
            </Badge>
            <Badge variant="outline" className="w-fit rounded-full">
              قراءة فقط
            </Badge>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            تصفح الحضور والدرجات والجداول والإعلانات المرتبطة بحسابك داخل المدرسة الحالية.
          </p>
        </div>

        <Separator />

        <nav className="flex flex-col gap-6">
          {portalNavigation.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="px-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-11 justify-start rounded-2xl px-3 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/95 hover:text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon data-icon="inline-start" />
                      <span className="flex-1 text-start">{item.label}</span>
                      {active ? <Eye className="text-sidebar-primary-foreground" /> : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl border border-dashed border-sidebar-border bg-background/50 p-4">
          <p className="text-sm font-medium">واجهة متابعة مطمئنة وواضحة</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            كل ما يظهر هنا مستند إلى الارتباط الفعلي بالطالب داخل المدرسة الحالية.
          </p>
        </div>
      </div>
    </aside>
  )
}
