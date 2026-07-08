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

export default async function WhatsappIntegrationPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="WhatsApp Business" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات واتساب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await listIntegrationSettingsForProviders(
    contextResult.data,
    ["whatsapp"]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="WhatsApp Business"
        description="إعدادات أولية لقوالب واتساب فقط دون إرسال رسائل أو تخزين أسرار حقيقية."
      />
      <IntegrationPlaceholderNotice />
      <IntegrationProviderCards settings={settings} />
    </div>
  )
}
