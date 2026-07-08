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

export default async function MoeIntegrationPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="وزارة التربية" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات وزارة التربية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await listIntegrationSettingsForProviders(
    contextResult.data,
    ["moe"]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="وزارة التربية"
        description="إعدادات مكانية فقط دون API فعلي أو تبادل بيانات خارجي."
      />
      <IntegrationPlaceholderNotice />
      <IntegrationProviderCards settings={settings} />
    </div>
  )
}
