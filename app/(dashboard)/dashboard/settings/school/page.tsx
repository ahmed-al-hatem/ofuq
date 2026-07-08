import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { getSchoolSettings } from "@/lib/settings/school-settings"

import { SchoolIdentityForm } from "../_components/settings-forms"

export default async function SchoolSettingsPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إعدادات المدرسة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات المدرسة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await getSchoolSettings(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إعدادات المدرسة"
        description="حدّث اسم العرض المحلي للمدرسة داخل واجهة الإدارة الحالية."
      />
      <SchoolIdentityForm schoolDisplayName={settings.school_display_name} />
    </div>
  )
}
