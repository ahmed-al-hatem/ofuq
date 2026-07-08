import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { listIntegrationSettings } from "@/lib/settings/integration-settings"

import {
  IntegrationOverviewGrid,
  IntegrationPlaceholderNotice,
} from "./_components/integration-sections"

export default async function IntegrationsOverviewPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="التكاملات"
          description="تكاملات المدرسة متاحة للإدارة فقط في هذه المرحلة."
        />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى التكاملات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await listIntegrationSettings(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التكاملات"
        description="نظرة عامة على مزودات الربط المستقبلية. جميعها إعدادات محلية فقط دون أي اتصال خارجي فعلي."
      />
      <IntegrationPlaceholderNotice />
      <IntegrationOverviewGrid settings={settings} />
    </div>
  )
}
