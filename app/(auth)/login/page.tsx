import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Building2, GraduationCap } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import { getDefaultRouteForRole } from "@/lib/auth/role-redirects"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { cn } from "@/lib/utils"
import { AuthShell } from "./_components/auth-shell"
import { LoginCard } from "./_components/login-card"

export default async function LoginPage() {
  const authenticatedUser = await getAuthenticatedUser()

  if (authenticatedUser?.membership?.status === "active") {
    redirect(getDefaultRouteForRole(authenticatedUser.membership.role))
  }

  return (
    <AuthShell
      tone="chooser"
      badge="بوابة الدخول"
      title="اختر نوع الحساب"
      description="انتقل إلى صفحة الدخول المناسبة، وسيبقى التوجيه النهائي مرتبطًا بالدور الحقيقي للحساب."
    >
      <Card className="border-border/70 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
        <CardHeader className="items-center gap-2 text-center">
          <CardTitle className="text-2xl">كيف تريد المتابعة؟</CardTitle>
          <CardDescription>
            اختر المسار الأقرب لطبيعة حسابك للمتابعة بتجربة أبسط وأنظف.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <LoginCard
              href={appRoutes.loginStaff}
              title="دخول الموظفين والإدارة"
              description="للمدراء والمعلمين والمحاسبين وأمناء المكتبة."
              icon={Building2}
              tone="staff"
            />
            <LoginCard
              href={appRoutes.loginPortal}
              title="دخول الطالب وولي الأمر"
              description="لمتابعة الحضور والدرجات والإعلانات والمالية."
              icon={GraduationCap}
              tone="portal"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href={appRoutes.home} className={cn(buttonVariants({ variant: "ghost" }))}>
            <ArrowLeft data-icon="inline-start" />
            العودة للرئيسية
          </Link>
          <Link
            href={appRoutes.loginResetPassword}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            نسيت كلمة المرور؟
          </Link>
        </CardFooter>
      </Card>
    </AuthShell>
  )
}
