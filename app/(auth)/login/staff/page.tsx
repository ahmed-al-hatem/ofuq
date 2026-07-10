import { redirect } from "next/navigation"

import { appRoutes } from "@/constants/routes"
import { getDefaultRouteForRole } from "@/lib/auth/role-redirects"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { AuthShell } from "../_components/auth-shell"
import { LoginForm } from "../login-form"

export default async function StaffLoginPage() {
  const authenticatedUser = await getAuthenticatedUser()

  if (authenticatedUser?.membership?.status === "active") {
    redirect(getDefaultRouteForRole(authenticatedUser.membership.role))
  }

  return (
    <AuthShell
      tone="staff"
      badge="دخول الموظفين والإدارة"
      title="تسجيل دخول الموظفين"
      description="ادخل إلى لوحة التحكم لإدارة العمليات المدرسية حسب صلاحيات دورك."
    >
      <LoginForm
        audience="staff"
        title="تسجيل دخول الموظفين"
        description="استخدم بريدك وكلمة المرور للوصول إلى لوحة التحكم."
        submitLabel="الدخول إلى لوحة التحكم"
        googleLabel="المتابعة باستخدام Google"
        alternateHref={appRoutes.loginPortal}
        alternateLabel="دخول الطالب وولي الأمر"
      />
    </AuthShell>
  )
}
