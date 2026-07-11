"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { portalNavigation } from "@/config/portal-navigation"
import { cn } from "@/lib/utils"

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-b bg-sidebar text-sidebar-foreground lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-5 lg:py-5">
        <nav className="flex flex-col gap-4">
          {portalNavigation.map((group) => (
            <div key={group.label ?? "root"} className="flex flex-col gap-1.5">
              {group.label ? (
                <p className="px-3 pt-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground">
                  {group.label}
                </p>
              ) : null}
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
                        "h-10 justify-start rounded-xl px-3 text-sm transition-colors",
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
