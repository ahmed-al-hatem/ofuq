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
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-[1720px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <AppSidebar user={user} />
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
