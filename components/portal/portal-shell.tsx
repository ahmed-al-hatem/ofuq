import type { ReactNode } from "react"

import { PortalHeader } from "@/components/portal/portal-header"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import type { PortalSessionUser } from "@/types/portal"

export function PortalShell({
  children,
  user,
}: Readonly<{
  children: ReactNode
  user: PortalSessionUser
}>) {
  return (
    <div className="min-h-screen bg-background">
      <PortalHeader user={user} />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1720px] lg:grid-cols-[20rem_minmax(0,1fr)]">
        <PortalSidebar />
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
