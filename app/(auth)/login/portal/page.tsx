import { redirect } from "next/navigation"

import { appRoutes } from "@/constants/routes"
import { getDefaultRouteForRole } from "@/lib/auth/role-redirects"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { AuthShell } from "../_components/auth-shell"
import { LoginForm } from "../login-form"

export default async function PortalLoginPage() {
  const authenticatedUser = await getAuthenticatedUser()

  if (authenticatedUser?.membership?.status === "active") {
    redirect(getDefaultRouteForRole(authenticatedUser.membership.role))
  }

  return (
    <AuthShell
      tone="portal"
      badge="بوابة الطالب وولي الأمر"
      title="دخول الطالب وولي الأمر"
      description="تابع البيانات المدرسية المرتبطة بك ضمن بوابة عرض آمنة ومبسطة."
    >
      <LoginForm
        audience="portal"
        title="دخول الطالب وولي الأمر"
        description="استخدم بريدك وكلمة المرور للوصول إلى بوابة المتابعة."
        submitLabel="الدخول إلى البوابة"
        googleLabel="المتابعة باستخدام Google"
        alternateHref={appRoutes.loginStaff}
        alternateLabel="دخول الموظفين والإدارة"
      />
    </AuthShell>
  )
}
