import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { appConfig } from "@/config/app"
import { appRoutes } from "@/constants/routes"
import { cn } from "@/lib/utils"

export function AppHeader() {
  return (
    <header className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.name}
              </p>
              <p className="text-base font-semibold">{appConfig.arabicName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">RTL</Badge>
            <Link
              href={appRoutes.login}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>

        <Separator />

        <p className="text-sm leading-6 text-muted-foreground">
          بنية dashboard عربية جاهزة للربط مع Supabase Auth و Server Actions.
        </p>
      </div>
    </header>
  )
}
