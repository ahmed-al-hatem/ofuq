import Link from "next/link"
import {
  Languages,
  Palette,
  Settings2,
  ShieldAlert,
  ToggleLeft,
  WalletCards,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appRoutes } from "@/constants/routes"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { listMessageTemplates } from "@/lib/settings/message-templates"
import {
  getSchoolSettings,
  normalizeModuleFlags,
} from "@/lib/settings/school-settings"

export default async function SettingsOverviewPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="الإعدادات"
          description="إعدادات المدرسة الأساسية متاحة للإدارة فقط."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الإعدادات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const [schoolSettings, templates] = await Promise.all([
    getSchoolSettings(contextResult.data),
    listMessageTemplates(contextResult.data),
  ])
  const moduleFlags = normalizeModuleFlags(schoolSettings.module_flags)
  const enabledModulesCount = Object.values(moduleFlags).filter(Boolean).length

  const cards = [
    {
      title: "إعدادات المدرسة",
      description:
        schoolSettings.school_display_name ?? "استخدم اسم عرض مخصص للواجهة الداخلية.",
      href: appRoutes.settingsSchool,
      icon: Settings2,
    },
    {
      title: "الهوية البصرية",
      description: "مراجعة الهوية والألوان والنصوص المرجعية ضمن النسخة الحالية.",
      href: appRoutes.settingsBranding,
      icon: Palette,
    },
    {
      title: "اللغة والمنطقة",
      description: `${schoolSettings.locale} / ${schoolSettings.direction} / ${schoolSettings.timezone}`,
      href: appRoutes.settingsLocalization,
      icon: Languages,
    },
    {
      title: "الوحدات",
      description: `${enabledModulesCount} وحدة محفوظة كمفعلة ضمن إعدادات المدرسة.`,
      href: appRoutes.settingsModules,
      icon: ToggleLeft,
    },
    {
      title: "القوالب",
      description: `${templates.length} قالبًا داخليًا محفوظًا داخل المدرسة الحالية.`,
      href: appRoutes.settingsTemplates,
      icon: WalletCards,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الإعدادات"
        description="مركز إعدادات المدرسة المحلية لعرض الهوية واللغة والوحدات والقوالب ضمن نطاق النسخة الحالية."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.title} className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={card.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فتح الصفحة
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
