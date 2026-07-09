import type { ReactNode } from "react"

import { AppHeader } from "@/components/app/app-header"
import { AppSidebar } from "@/components/app/app-sidebar"
import type { SessionUser } from "@/types/auth"

export function AppShell({
  children,
  user,
}: Readonly<{
  children: ReactNode
  user: SessionUser
}>) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1720px] lg:grid-cols-[20rem_minmax(0,1fr)]">
        <AppSidebar user={user} />
        <div className="flex min-w-0 flex-col">
          <AppHeader user={user} />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
