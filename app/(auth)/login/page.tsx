import Link from "next/link"
import { redirect } from "next/navigation"
import { Settings2, Sparkles } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appRoutes } from "@/constants/routes"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { cn } from "@/lib/utils"
import { LoginForm } from "./login-form"

const authPlans = [
  "تسجيل الدخول عبر البريد الإلكتروني وكلمة المرور",
  "توجيه المستخدم تلقائيًا إلى لوحة التحكم أو البوابة بحسب الدور",
  "إدارة الجلسات عبر Supabase Auth من جهة الخادم",
]

export default async function LoginPage() {
  const authenticatedUser = await getAuthenticatedUser()

  if (authenticatedUser?.membership?.status === "active") {
    redirect(appRoutes.dashboard)
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-center gap-5">
          <Badge className="w-fit bg-secondary text-secondary-foreground">
            تسجيل دخول آمن
          </Badge>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              تسجيل الدخول إلى {""}
              <span className="text-primary">{`أُفُق`}</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              استخدم أحد حسابات العرض المحلية للوصول إلى لوحة الإدارة أو بوابة
              المتابعة. بعد تسجيل الدخول يتم توجيه كل مستخدم إلى المسار المناسب
              لدوره داخل المدرسة.
            </p>
          </div>

          <div className="grid gap-3">
            {authPlans.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Sparkles className="size-4 shrink-0 text-secondary" />
                <span className="text-sm leading-6">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={appRoutes.home} className={cn(buttonVariants({ variant: "outline" }))}>
              العودة للرئيسية
            </Link>
            <Link href={appRoutes.dashboard} className={buttonVariants()}>
              <Settings2 data-icon="inline-start" />
              متابعة العرض بعد الدخول
            </Link>
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  )
}
