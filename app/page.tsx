import Link from "next/link"
import { ArrowLeft, BookOpen, ShieldCheck, Sparkles, Users2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appConfig } from "@/config/app"
import { appRoutes } from "@/constants/routes"
import { cn } from "@/lib/utils"

const highlights = [
  {
    icon: ShieldCheck,
    title: "بنية متعددة المستأجرين",
    description: "تهيئة واضحة لـ tenant_id و school_id من أول يوم.",
  },
  {
    icon: Users2,
    title: "أدوار ثابتة قابلة للتوسعة",
    description: "system_admin و school_admin وبقية الأدوار ضمن بنية واضحة قابلة للتوسع.",
  },
  {
    icon: BookOpen,
    title: "واجهة عمليات يومية",
    description: "تصميم كثيف وواضح مناسب لموظفي المدرسة واللوحات التشغيلية.",
  },
]

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_right,hsla(var(--brand-gold)/0.24),transparent_35%),radial-gradient(circle_at_top_left,hsla(var(--brand-teal)/0.16),transparent_30%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">Ofuq</p>
              <h1 className="text-lg font-semibold tracking-tight">{appConfig.arabicName}</h1>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            عربي أولًا · RTL أصيل · متعدد المدارس
          </Badge>
        </header>

        <section className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <Badge className="w-fit bg-secondary text-secondary-foreground">
              جاهز لمسار العرض
            </Badge>
            <div className="flex flex-col gap-4">
              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-5xl">
                منصة إدارة مدرسية عربية جاهزة لعرض رحلة العمل اليومية بوضوح وثقة.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {appConfig.description} تعرض مسارًا واضحًا يبدأ من تسجيل الدخول، ثم
                ينتقل إلى لوحة التحكم، الوحدات التشغيلية، وبوابة ولي الأمر والطالب
                ضمن تجربة عربية RTL مناسبة للعرض النهائي.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={appRoutes.login} className={buttonVariants({ size: "lg" })}>
                بدء العرض
                <ArrowLeft data-icon="inline-start" />
              </Link>
              <Link
                href={appRoutes.dashboard}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                استعراض لوحة التحكم
              </Link>
            </div>
          </div>

          <Card className="border-border/70 bg-card/95 shadow-sm backdrop-blur">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle>ماذا يبرز العرض؟</CardTitle>
              <CardDescription>
                صفحات عملية متصلة بالهوية المدرسية، الأدوار، والبيانات المحلية الجاهزة للديمو.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
