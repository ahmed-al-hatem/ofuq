import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { getSchoolSettings } from "@/lib/settings/school-settings"

import { LocalizationSettingsForm } from "../_components/settings-forms"

export default async function LocalizationSettingsPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="اللغة والمنطقة" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى إعدادات اللغة والمنطقة"
          description={contextResult.error}
        />
      </div>
    )
  }

  const settings = await getSchoolSettings(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="اللغة والمنطقة"
        description="إعدادات محلية لواجهة المدرسة واتجاهها والمنطقة الزمنية وبداية الأسبوع الأكاديمي."
      />
      <LocalizationSettingsForm
        timezone={settings.timezone}
        locale={settings.locale}
        direction={settings.direction as "rtl" | "ltr"}
        academicWeekStart={settings.academic_week_start}
      />
    </div>
  )
}
