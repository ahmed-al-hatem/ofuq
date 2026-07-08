import { ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { settingsAdminRoles } from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { listMessageTemplates } from "@/lib/settings/message-templates"

import { MessageTemplateForm } from "../_components/settings-forms"

export default async function MessageTemplatesPage() {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="القوالب" />
        <EmptyState
          icon={ShieldAlert}
          title="لا يمكن الوصول إلى القوالب"
          description={contextResult.error}
        />
      </div>
    )
  }

  const templates = await listMessageTemplates(contextResult.data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="القوالب"
        description="قوالب رسائل محلية محفوظة للمدرسة الحالية فقط. لا يتم الإرسال عبر بريد أو SMS أو واتساب في هذه المرحلة."
      />
      {templates.length === 0 ? (
        <EmptyState
          title="لا توجد قوالب محفوظة"
          description="أعد تشغيل البذور المحلية أو أضف قوالب لاحقًا عند توسيع هذه الوحدة."
        />
      ) : (
        <section className="grid gap-4">
          {templates.map((template) => (
            <MessageTemplateForm key={template.id} template={template} />
          ))}
        </section>
      )}
    </div>
  )
}
