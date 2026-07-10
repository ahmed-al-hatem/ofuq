import Link from "next/link"
import { ExternalLink, PlugZap, ShieldAlert } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  SETTINGS_PLACEHOLDER_WARNING,
  SETTINGS_SECRET_WARNING,
  INTEGRATION_PROVIDER_BY_KEY,
} from "@/lib/settings/constants"
import type { IntegrationSettingView } from "@/lib/settings/integration-settings"
import {
  INTEGRATION_STATUS_LABELS_AR,
  INTEGRATION_STATUS_TONES,
} from "@/types/settings"

function formatDate(value: string | null) {
  if (!value) {
    return "لم يتم الفحص بعد"
  }

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function IntegrationPlaceholderNotice() {
  return (
    <Card className="border-dashed border-accent/50 bg-accent/5 shadow-sm">
      <CardContent className="flex flex-col gap-3 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
            <ShieldAlert className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">تنبيه مهم</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {SETTINGS_PLACEHOLDER_WARNING}
            </p>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {SETTINGS_SECRET_WARNING}
        </p>
      </CardContent>
    </Card>
  )
}

export function IntegrationOverviewGrid({
  settings,
}: {
  settings: IntegrationSettingView[]
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {settings.map((setting) => {
        const definition = INTEGRATION_PROVIDER_BY_KEY[setting.provider]

        return (
          <Card key={setting.provider} className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <CardTitle>{definition.displayName}</CardTitle>
                <CardDescription>{definition.summary}</CardDescription>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                <PlugZap className="size-5" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={INTEGRATION_STATUS_TONES[setting.status]}>
                  {INTEGRATION_STATUS_LABELS_AR[setting.status]}
                </StatusBadge>
                <StatusBadge status={setting.enabled ? "info" : "neutral"}>
                  {setting.enabled ? "مفعّل محليًا" : "غير مفعّل"}
                </StatusBadge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                لا يوجد اتصال خارجي فعلي في النسخة المحلية.
              </p>
              <Link
                href={definition.href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink data-icon="inline-start" />
                فتح الصفحة
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

export function IntegrationProviderCards({
  settings,
}: {
  settings: IntegrationSettingView[]
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {settings.map((setting) => {
        const definition = INTEGRATION_PROVIDER_BY_KEY[setting.provider]
        const settingsSummary = Object.entries(setting.settings)

        return (
          <Card key={setting.provider} className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-2">
                  <CardTitle>{definition.displayName}</CardTitle>
                  <CardDescription>{definition.label}</CardDescription>
                </div>
                <StatusBadge status={INTEGRATION_STATUS_TONES[setting.status]}>
                  {INTEGRATION_STATUS_LABELS_AR[setting.status]}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm font-medium">الحالة الحالية</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {setting.enabled ? "مفعّل محليًا" : "غير مفعّل"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm font-medium">آخر فحص</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatDate(setting.last_checked_at)}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-sm font-medium">ملخص الإعدادات</p>
                {settingsSummary.length === 0 ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    لا توجد إعدادات محفوظة بعد. يمكن استخدام هذه الصفحة لشرح نطاق التكاملات ضمن النسخة الحالية.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                    {settingsSummary.map(([key, value]) => (
                      <p key={key}>
                        {key}: {typeof value === "string" ? value : JSON.stringify(value)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">حقل مرجعي لسر API</p>
                  <Input value="غير محفوظ في هذه المرحلة" disabled dir="ltr" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">حقل مرجعي لعنوان الربط</p>
                  <Input value="مرجع محلي غير متصل" disabled dir="ltr" />
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {SETTINGS_PLACEHOLDER_WARNING}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {SETTINGS_SECRET_WARNING}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
