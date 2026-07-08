import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import {
  getSchoolSettings,
  normalizeModuleFlags,
} from "@/lib/settings/school-settings"

import { ModuleFlagsForm } from "../_components/settings-forms"

export default async function ModulesSettingsPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="الوحدات" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات الوحدات"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await getSchoolSettings(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الوحدات"
        description="مفاتيح مرجعية لواجهة المدرسة فقط. لا يتم إيقاف الوحدات أو المسارات الفعلية في هذه المرحلة."
      />
      <ModuleFlagsForm moduleFlags={normalizeModuleFlags(settings.module_flags)} />
    </div>
  )
}
