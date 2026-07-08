import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { listIntegrationSettingsForProviders } from "@/lib/settings/integration-settings"

import {
  IntegrationPlaceholderNotice,
  IntegrationProviderCards,
} from "../_components/integration-sections"

export default async function BiIntegrationsPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تكاملات ذكاء الأعمال" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات ذكاء الأعمال"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await listIntegrationSettingsForProviders(
    contextResult.data,
    ["power_bi", "looker"]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تكاملات ذكاء الأعمال"
        description="إعدادات Power BI وLooker للتهيئة المستقبلية فقط دون تضمين أو اتصال خارجي."
      />
      <IntegrationPlaceholderNotice />
      <IntegrationProviderCards settings={settings} />
    </div>
  )
}
