"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { appRoutes } from "@/constants/routes"
import {
  failure,
  success,
  type ActionResult,
  validationFailure,
} from "@/lib/actions/action-result"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  SETTINGS_MODULE_DEFINITIONS,
  settingsAdminRoles,
} from "@/lib/settings/constants"
import { requireSettingsContext } from "@/lib/settings/context"
import { updateMessageTemplate } from "@/lib/settings/message-templates"
import {
  updateSchoolBrandingSettings,
  updateSchoolIdentitySettings,
  updateSchoolLocalizationSettings,
  updateSchoolModuleFlags,
  type SchoolBrandingSettings,
} from "@/lib/settings/school-settings"

const messageTemplateStatusValues = ["draft", "active", "archived"] as const

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))

const optionalHexColorSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || /^#[0-9A-Fa-f]{6}$/.test(value), {
    message: "استخدم لونًا بصيغة HEX مثل #0D1B3D",
  })

const schoolIdentitySchema = z.object({
  school_display_name: optionalTextSchema,
})

const brandingSchema = z.object({
  interface_name: optionalTextSchema,
  logo_hint: optionalTextSchema,
  primary_color: optionalHexColorSchema,
  secondary_color: optionalHexColorSchema,
  accent_color: optionalHexColorSchema,
})

const localizationSchema = z.object({
  timezone: z.string().trim().min(1, "المنطقة الزمنية مطلوبة"),
  locale: z.enum(["ar", "en"]),
  direction: z.enum(["rtl", "ltr"]),
  academic_week_start: z.coerce
    .number()
    .int("بداية الأسبوع غير صالحة")
    .min(0, "بداية الأسبوع غير صالحة")
    .max(6, "بداية الأسبوع غير صالحة"),
})

const moduleFlagsSchema = z.object(
  Object.fromEntries(
    SETTINGS_MODULE_DEFINITIONS.map((item) => [item.key, z.boolean()])
  ) as Record<(typeof SETTINGS_MODULE_DEFINITIONS)[number]["key"], z.ZodBoolean>
)

const messageTemplateSchema = z.object({
  id: z.string().uuid("القالب المطلوب غير صالح"),
  title: z.string().trim().min(1, "عنوان القالب مطلوب"),
  body: z.string().trim().min(1, "محتوى القالب مطلوب"),
  status: z.enum(messageTemplateStatusValues),
})

export type SettingsActionState = ActionResult<{ redirectTo?: string }> | null

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1"
}

async function writeSettingsAuditLog(input: {
  actor_user_id: string
  tenant_id: string
  school_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata?: Record<string, string | number | boolean | null>
}) {
  const supabase = await createSupabaseServerClient()

  await supabase.from("audit_logs").insert({
    tenant_id: input.tenant_id,
    school_id: input.school_id,
    actor_user_id: input.actor_user_id,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    metadata: input.metadata ?? {},
  })
}

function revalidateSettingsPages() {
  revalidatePath(appRoutes.settings)
  revalidatePath(appRoutes.settingsSchool)
  revalidatePath(appRoutes.settingsBranding)
  revalidatePath(appRoutes.settingsLocalization)
  revalidatePath(appRoutes.settingsModules)
  revalidatePath(appRoutes.settingsTemplates)
}

export async function updateSchoolIdentitySettingsAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = schoolIdentitySchema.safeParse({
    school_display_name: formData.get("school_display_name"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من إعدادات المدرسة فشل"
    )
  }

  try {
    const settings = await updateSchoolIdentitySettings(
      contextResult.data,
      parsedValues.data
    )

    await writeSettingsAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "settings.school.updated",
      entity_type: "school_settings",
      entity_id: settings.id,
      metadata: {
        school_display_name: settings.school_display_name,
      },
    })
  } catch {
    return failure("تعذر حفظ إعدادات المدرسة حاليًا")
  }

  revalidateSettingsPages()
  return success({}, "تم حفظ إعدادات المدرسة")
}

export async function updateBrandingSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = brandingSchema.safeParse({
    interface_name: formData.get("interface_name"),
    logo_hint: formData.get("logo_hint"),
    primary_color: formData.get("primary_color"),
    secondary_color: formData.get("secondary_color"),
    accent_color: formData.get("accent_color"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من إعدادات الهوية البصرية فشل"
    )
  }

  try {
    const settings = await updateSchoolBrandingSettings(
      contextResult.data,
      parsedValues.data as SchoolBrandingSettings
    )

    await writeSettingsAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "settings.branding.updated",
      entity_type: "school_settings",
      entity_id: settings.id,
      metadata: {
        branding_placeholder: true,
      },
    })
  } catch {
    return failure("تعذر حفظ إعدادات الهوية البصرية حاليًا")
  }

  revalidateSettingsPages()
  return success({}, "تم حفظ إعدادات الهوية البصرية")
}

export async function updateLocalizationSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = localizationSchema.safeParse({
    timezone: formData.get("timezone"),
    locale: formData.get("locale"),
    direction: formData.get("direction"),
    academic_week_start: formData.get("academic_week_start"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من إعدادات اللغة والمنطقة فشل"
    )
  }

  try {
    const settings = await updateSchoolLocalizationSettings(
      contextResult.data,
      parsedValues.data
    )

    await writeSettingsAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "settings.localization.updated",
      entity_type: "school_settings",
      entity_id: settings.id,
      metadata: {
        locale: settings.locale,
        direction: settings.direction,
        academic_week_start: settings.academic_week_start,
      },
    })
  } catch {
    return failure("تعذر حفظ إعدادات اللغة والمنطقة حاليًا")
  }

  revalidateSettingsPages()
  return success({}, "تم حفظ إعدادات اللغة والمنطقة")
}

export async function updateModuleFlagsSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = moduleFlagsSchema.safeParse(
    Object.fromEntries(
      SETTINGS_MODULE_DEFINITIONS.map((item) => [
        item.key,
        parseCheckboxValue(formData.get(item.key)),
      ])
    )
  )

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من مفاتيح الوحدات فشل"
    )
  }

  try {
    const settings = await updateSchoolModuleFlags(
      contextResult.data,
      parsedValues.data
    )

    await writeSettingsAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "settings.modules.updated",
      entity_type: "school_settings",
      entity_id: settings.id,
      metadata: {
        enabled_modules: Object.values(parsedValues.data).filter(Boolean).length,
      },
    })
  } catch {
    return failure("تعذر حفظ مفاتيح الوحدات حاليًا")
  }

  revalidateSettingsPages()
  return success({}, "تم حفظ مفاتيح الوحدات")
}

export async function updateMessageTemplateAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<ActionResult<{ redirectTo?: string }>> {
  const contextResult = await requireSettingsContext(settingsAdminRoles)

  if (!contextResult.ok) {
    return failure(contextResult.error)
  }

  const parsedValues = messageTemplateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    body: formData.get("body"),
    status: formData.get("status"),
  })

  if (!parsedValues.success) {
    return validationFailure(
      parsedValues.error.flatten().fieldErrors,
      "التحقق من القالب فشل"
    )
  }

  try {
    const template = await updateMessageTemplate(
      contextResult.data,
      parsedValues.data
    )

    await writeSettingsAuditLog({
      actor_user_id: contextResult.data.user_id,
      tenant_id: contextResult.data.tenant_id,
      school_id: contextResult.data.school_id,
      action: "settings.message_template.updated",
      entity_type: "message_template",
      entity_id: template.id,
      metadata: {
        template_key: template.template_key,
        channel: template.channel,
        status: template.status,
      },
    })
  } catch {
    return failure("تعذر حفظ القالب حاليًا")
  }

  revalidateSettingsPages()
  return success({}, "تم حفظ القالب")
}
