import { redirect } from "next/navigation"

import { getDefaultRouteForRole } from "@/lib/auth/role-redirects"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { AuthShell } from "../_components/auth-shell"
import { ResetPasswordCard } from "../_components/reset-password-card"

export default async function ResetPasswordPage() {
  const authenticatedUser = await getAuthenticatedUser()

  if (authenticatedUser?.membership?.status === "active") {
    redirect(getDefaultRouteForRole(authenticatedUser.membership.role))
  }

  return (
    <AuthShell
      tone="reset"
      badge="استعادة الوصول"
      title="إعادة تعيين كلمة المرور"
      description="أدخل بريدك الإلكتروني لطلب إعادة التعيين عند تفعيل خدمة البريد."
    >
      <ResetPasswordCard />
    </AuthShell>
  )
}
