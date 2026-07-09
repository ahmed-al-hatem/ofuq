import type { ReactNode } from "react"
import { ShieldAlert } from "lucide-react"
import { redirect } from "next/navigation"

import { AppShell } from "@/components/app/app-shell"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { appRoutes } from "@/constants/routes"
import { getDefaultRouteForRole } from "@/lib/auth/role-redirects"
import { getAuthenticatedUser, getCurrentAuthUser } from "@/lib/auth/session"
import { signOutFromForm } from "@/lib/actions/auth"
import { isPortalRole } from "@/lib/portal/access"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const authUser = await getCurrentAuthUser()

  if (!authUser) {
    redirect(appRoutes.login)
  }

  const authenticatedUser = await getAuthenticatedUser()

  if (!authenticatedUser) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-xl flex-col gap-4">
          <EmptyState
            icon={ShieldAlert}
            title="لا يمكن الوصول إلى الحساب الحالي"
            description="لا يوجد ملف مستخدم مرتبط بهذا الحساب حاليًا. يرجى التواصل مع الإدارة أو تسجيل الخروج ثم المحاولة مرة أخرى."
          />
          <form action={signOutFromForm} className="flex justify-center">
            <Button type="submit" variant="outline" size="lg">
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </main>
    )
  }

  if (
    !authenticatedUser.membership ||
    authenticatedUser.membership.status !== "active"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-xl flex-col gap-4">
          <EmptyState
            icon={ShieldAlert}
            title="لا توجد عضوية نشطة مرتبطة بهذا الحساب"
            description="تم تسجيل الدخول بنجاح، لكن لا توجد عضوية نشطة تسمح بعرض لوحة التحكم. يرجى التواصل مع إدارة المدرسة."
          />
          <form action={signOutFromForm} className="flex justify-center">
            <Button type="submit" variant="outline" size="lg">
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </main>
    )
  }

  if (isPortalRole(authenticatedUser.membership.role)) {
    redirect(getDefaultRouteForRole(authenticatedUser.membership.role))
  }

  return <AppShell user={authenticatedUser}>{children}</AppShell>
}
