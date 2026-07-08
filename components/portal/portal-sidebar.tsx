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
        <div className="space-y-3">
          <Link href={appRoutes.home} className="block">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <span className="text-base font-semibold">أ</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.name}
                </p>
                <h2 className="text-lg font-semibold">{appConfig.arabicName}</h2>
              </div>
            </div>
          </Link>
          <Badge variant="secondary" className="w-fit rounded-full">
            بوابة قراءة فقط
          </Badge>
        </div>

        <Separator />

        <nav className="flex flex-col gap-6">
          {portalNavigation.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
                        buttonVariants({
                          variant: active ? "secondary" : "ghost",
                          size: "sm",
                        }),
                        "justify-start"
                      )}
                    >
                      <Icon data-icon="inline-start" />
                      <span className="flex-1 text-start">{item.label}</span>
                      {active ? <Eye className="size-3.5" /> : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
