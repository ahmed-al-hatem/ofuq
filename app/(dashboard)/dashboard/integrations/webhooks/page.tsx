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

export default async function WebhooksIntegrationPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Webhooks" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات الويب هوكس"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await listIntegrationSettingsForProviders(
    contextResult.data,
    ["webhooks"]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Webhooks"
        description="صفحة إعدادات تحضيرية فقط لنقاط الربط دون تنفيذ طلبات أو إعادة محاولات."
      />
      <IntegrationPlaceholderNotice />
      <IntegrationProviderCards settings={settings} />
    </div>
  )
}
