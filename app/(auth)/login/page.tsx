import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
      badge="بوابة الدخول الموحدة"
      title="اختر طريقة الدخول"
      description="حدّد نوع حسابك للانتقال إلى تجربة الدخول المناسبة."
      highlights={[
        {
          icon: ShieldCheck,
          title: "تسجيل دخول مؤمّن",
          description: "التحقق الفعلي من بيانات الدخول والعضوية يتم على الخادم عبر Supabase Auth.",
        },
        {
          icon: Landmark,
          title: "إعادة توجيه حسب الدور الحقيقي",
          description: "بعد تسجيل الدخول، يتم تحديد لوحة التحكم أو البوابة اعتمادًا على الدور المخزّن في قاعدة البيانات فقط.",
        },
        {
          icon: Sparkles,
          title: "تجربة أوضح لكل فئة",
          description: "تقسيم المسارات هنا يوضّح واجهة الدخول المناسبة من دون تحويل المسار المختار إلى مصدر صلاحيات.",
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <Link href={appRoutes.home} className={cn(buttonVariants({ variant: "outline" }))}>
            العودة إلى الرئيسية
          </Link>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-muted-foreground">
            ملائم للموظفين والطلاب وأولياء الأمور
          </Badge>
        </div>
      }
    >
      <Card className="border-border/70 bg-card/95 shadow-xl shadow-primary/5">
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">اختر المسار المناسب لحسابك</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              تم تصميم كل صفحة دخول بما يناسب طبيعة استخدامها، مع بقاء التحقق
              والصلاحيات على الخادم فقط.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <LoginCard
              href={appRoutes.loginStaff}
              title="لوحة الموظفين والإدارة"
              description="للمدراء والمعلمين والمحاسبين وأمناء المكتبة."
              icon={Building2}
              tone="staff"
            />
            <LoginCard
              href={appRoutes.loginPortal}
              title="بوابة الطالب وولي الأمر"
              description="لمتابعة الحضور والدرجات والإعلانات والمالية."
              icon={GraduationCap}
              tone="portal"
            />
          </div>

          <Separator />

          <Alert className="border-border/70 bg-muted/60">
            <Sparkles className="size-4" />
            <AlertTitle>ملاحظات الثقة والأمان</AlertTitle>
            <AlertDescription>
              اختيارك لهذه الصفحة يوجّهك بصريًا فقط. لا يتم منح أي صلاحية من
              جهة الواجهة، كما أن خدمات Google وإعادة التعيين ما تزالان
              واجهات محلية تجريبية في هذه المرحلة.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between gap-3">
            <Link href={appRoutes.home} className={cn(buttonVariants({ variant: "ghost" }))}>
              <ArrowLeft data-icon="inline-start" />
              الرجوع
            </Link>
            <Link
              href={appRoutes.loginResetPassword}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              طلب إعادة تعيين كلمة المرور
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
