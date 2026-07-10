import { redirect } from "next/navigation"
import { BellRing, MailQuestion, ShieldCheck } from "lucide-react"

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
      description="أدخل بريدك الإلكتروني، وسنرسل لك تعليمات إعادة التعيين عند تفعيل خدمة البريد."
      highlights={[
        {
          icon: MailQuestion,
          title: "واجهة جاهزة للربط",
          description: "تم إعداد مسار الطلب بصريًا ليُربط لاحقًا بخدمة البريد من دون تغيير تجربة المستخدم من جديد.",
        },
        {
          icon: ShieldCheck,
          title: "من دون استدعاءات حساسة الآن",
          description: "هذه الصفحة لا تستدعي Supabase ولا ترسل بريدًا فعليًا في النسخة المحلية الحالية.",
        },
        {
          icon: BellRing,
          title: "تجهيز مبكر للتفعيل لاحقًا",
          description: "بمجرد اعتماد خدمة البريد، يمكن تحويل هذه الواجهة إلى تدفق حقيقي مع أقل أثر على التصميم.",
        },
      ]}
    >
      <ResetPasswordCard />
    </AuthShell>
  )
}
