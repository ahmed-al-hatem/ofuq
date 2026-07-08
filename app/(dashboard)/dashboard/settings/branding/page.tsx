import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  SETTINGS_PLACEHOLDER_WARNING,
  settingsAdminRoles,
} from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import {
  getSchoolSettings,
  normalizeSchoolBranding,
} from "@/lib/settings/school-settings"

import { BrandingSettingsForm } from "../_components/settings-forms"

export default async function BrandingSettingsPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الهوية البصرية" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى الهوية البصرية"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await getSchoolSettings(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الهوية البصرية"
        description={`${SETTINGS_PLACEHOLDER_WARNING} لا يتم حفظ أصول أو شعارات فعلية.`}
      />
      <BrandingSettingsForm
        branding={normalizeSchoolBranding(settings.branding)}
      />
    </div>
  )
}
