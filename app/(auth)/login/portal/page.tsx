import { redirect } from "next/navigation"
import { BookOpenText, GraduationCap, ShieldCheck } from "lucide-react"

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
      highlights={[
        {
          icon: GraduationCap,
          title: "وصول أوضح للمتابعة اليومية",
          description: "ادخل إلى حضور الطالب، الدرجات، الجداول، الإعلانات، والملخصات المالية من واجهة أبسط وأكثر هدوءًا.",
        },
        {
          icon: BookOpenText,
          title: "بوابة قراءة ومتابعة",
          description: "المحتوى هنا مخصّص للعرض والمتابعة فقط ضمن النطاق الحالي للبوابة.",
        },
        {
          icon: ShieldCheck,
          title: "التحقق لا يعتمد على المسار",
          description: "حتى لو دخل المستخدم من هذه الصفحة أو من صفحة الموظفين، تبقى الوجهة النهائية مرتبطة بالدور الحقيقي للحساب.",
        },
      ]}
    >
      <LoginForm
        audience="portal"
        title="دخول الطالب وولي الأمر"
        description="تابع البيانات المدرسية المرتبطة بك ضمن بوابة عرض آمنة ومبسطة."
        submitLabel="الدخول إلى البوابة"
        googleLabel="المتابعة باستخدام Google"
        alternateHref={appRoutes.loginStaff}
        alternateLabel="دخول الموظفين والإدارة"
      />
    </AuthShell>
  )
}
