import { redirect } from "next/navigation"
import { Building2, ShieldCheck, Sparkles } from "lucide-react"

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
      highlights={[
        {
          icon: Building2,
          title: "موجّه لفرق التشغيل",
          description: "مناسب للإدارة المدرسية، المعلمين، المحاسبين، وأمناء المكتبة ضمن نفس نموذج الأمان الحالي.",
        },
        {
          icon: ShieldCheck,
          title: "صلاحيات مستمدة من العضوية",
          description: "بعد نجاح تسجيل الدخول، يعتمد النظام على العضوية النشطة والدور الفعلي لتحديد ما يمكنك الوصول إليه.",
        },
        {
          icon: Sparkles,
          title: "تجربة احترافية مركزة",
          description: "واجهة أسرع وأوضح للدخول إلى مهام التشغيل اليومية من دون أي تغيير على نموذج auth الأساسي.",
        },
      ]}
    >
      <LoginForm
        audience="staff"
        title="تسجيل دخول الموظفين"
        description="ادخل إلى لوحة التحكم لإدارة العمليات المدرسية حسب صلاحيات دورك."
        submitLabel="الدخول إلى لوحة التحكم"
        googleLabel="المتابعة باستخدام Google"
        alternateHref={appRoutes.loginPortal}
        alternateLabel="دخول الطالب وولي الأمر"
      />
    </AuthShell>
  )
}
