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

export default async function CalendarIntegrationsPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="تكاملات التقويم" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات التقويم"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await listIntegrationSettingsForProviders(
    contextResult.data,
    ["google_calendar", "microsoft_calendar"]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="تكاملات التقويم"
        description="إعدادات Google Calendar وMicrosoft Calendar للعرض المحلي فقط دون OAuth أو مزامنة."
      />
      <IntegrationPlaceholderNotice />
      <IntegrationProviderCards settings={settings} />
    </div>
  )
}
