import Link from "next/link"
import { Mail, Settings2, Sparkles } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { appRoutes } from "@/constants/routes"
import { cn } from "@/lib/utils"

const authPlans = [
  "تسجيل الدخول عبر البريد الإلكتروني وكلمة المرور",
  "دعم Google SSO عندما تصبح المصادقة جاهزة",
  "إدارة الجلسات عبر Supabase Auth من جهة الخادم",
]

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-center gap-5">
          <Badge className="w-fit bg-secondary text-secondary-foreground">
            صفحة تمهيدية
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              تسجيل الدخول إلى {""}
              <span className="text-primary">{`أُفُق`}</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              هذه الصفحة مهيأة لاحقًا لـ Supabase Auth. في المرحلة الحالية
              نستعرض مسار المصادقة فقط حتى تبقى البنية واضحة وواقعية.
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
              فتح لوحة التحكم
            </Link>
          </div>
        </section>

        <Card className="self-center border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Mail className="size-5" />
            </div>
            <CardTitle className="pt-3">تخطيط المصادقة</CardTitle>
            <CardDescription>
              فصل واضح بين العميل والخادم قبل إضافة النموذج الفعلي.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              سيُستخدم البريد الإلكتروني وكلمة المرور أولًا، مع ترك مساحة منظمة
              لإضافة تسجيل Google لاحقًا.
            </p>
            <p>
              وصول الخدمة الإدارية يبقى على الخادم فقط، ولن يُمرّر إلى الواجهة.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
