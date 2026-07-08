import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  ACADEMIC_WEEK_START_OPTIONS,
  DEFAULT_MODULE_FLAGS,
  SETTINGS_MODULE_DEFINITIONS,
  type SettingsModuleFlagKey,
} from "@/lib/settings/constants"
import type { SettingsContext } from "@/lib/settings/context"
import type { Json, TablesInsert, TablesUpdate } from "@/types/database"
import type { SchoolSettings } from "@/types/settings"

export type SchoolBrandingSettings = {
  interface_name: string | null
  logo_hint: string | null
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
}

export type UpdateSchoolIdentityInput = {
  school_display_name: string | null
}

export type UpdateLocalizationInput = {
  timezone: string
  locale: string
  direction: "rtl" | "ltr"
  academic_week_start: number
}

export type UpdateBrandingInput = SchoolBrandingSettings

export type UpdateModuleFlagsInput = Record<SettingsModuleFlagKey, boolean>

const defaultBranding: SchoolBrandingSettings = {
  interface_name: "منصة أفق المدرسية",
  logo_hint: "placeholder-only",
  primary_color: "#0D1B3D",
  secondary_color: "#0D7A7B",
  accent_color: "#C9A24B",
}

function trimToNull(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue === "" ? null : normalizedValue
}

function getObjectValue(value: Json | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {}
}

export function normalizeSchoolBranding(
  value: Json | null | undefined
): SchoolBrandingSettings {
  const branding = getObjectValue(value)

  return {
    interface_name:
      typeof branding.interface_name === "string"
        ? branding.interface_name
        : defaultBranding.interface_name,
    logo_hint:
      typeof branding.logo_hint === "string"
        ? branding.logo_hint
        : defaultBranding.logo_hint,
    primary_color:
      typeof branding.primary_color === "string"
        ? branding.primary_color
        : defaultBranding.primary_color,
    secondary_color:
      typeof branding.secondary_color === "string"
        ? branding.secondary_color
        : defaultBranding.secondary_color,
    accent_color:
      typeof branding.accent_color === "string"
        ? branding.accent_color
        : defaultBranding.accent_color,
  }
}

export function normalizeModuleFlags(
  value: Json | null | undefined
): Record<SettingsModuleFlagKey, boolean> {
  const moduleFlags = getObjectValue(value)

  return Object.fromEntries(
    SETTINGS_MODULE_DEFINITIONS.map((item) => [
      item.key,
      typeof moduleFlags[item.key] === "boolean"
        ? moduleFlags[item.key]
        : DEFAULT_MODULE_FLAGS[item.key],
    ])
  ) as Record<SettingsModuleFlagKey, boolean>
}

async function createDefaultSchoolSettings(
  context: SettingsContext
): Promise<SchoolSettings> {
  const supabase = await createSupabaseServerClient()
  const defaultWeekStart = ACADEMIC_WEEK_START_OPTIONS[0]?.value ?? 0
  const record: TablesInsert<"school_settings"> = {
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    school_display_name: null,
    timezone: "Asia/Damascus",
    locale: "ar",
    direction: "rtl",
    academic_week_start: defaultWeekStart,
    branding: defaultBranding,
    module_flags: DEFAULT_MODULE_FLAGS,
    updated_by_user_id: context.user_id,
  }

  const { data, error } = await supabase
    .from("school_settings")
    .insert(record)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getSchoolSettings(
  context: SettingsContext
): Promise<SchoolSettings> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("school_settings")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return createDefaultSchoolSettings(context)
  }

  return data
}

async function updateSchoolSettingsRecord(
  context: SettingsContext,
  values: TablesUpdate<"school_settings">
): Promise<SchoolSettings> {
  const supabase = await createSupabaseServerClient()
  const settings = await getSchoolSettings(context)
  const { data, error } = await supabase
    .from("school_settings")
    .update({
      ...values,
      updated_by_user_id: context.user_id,
    })
    .eq("id", settings.id)
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateSchoolIdentitySettings(
  context: SettingsContext,
  input: UpdateSchoolIdentityInput
): Promise<SchoolSettings> {
  return updateSchoolSettingsRecord(context, {
    school_display_name: trimToNull(input.school_display_name),
  })
}

export async function updateSchoolLocalizationSettings(
  context: SettingsContext,
  input: UpdateLocalizationInput
): Promise<SchoolSettings> {
  return updateSchoolSettingsRecord(context, {
    timezone: input.timezone.trim(),
    locale: input.locale.trim(),
    direction: input.direction,
    academic_week_start: input.academic_week_start,
  })
}

export async function updateSchoolBrandingSettings(
  context: SettingsContext,
  input: UpdateBrandingInput
): Promise<SchoolSettings> {
  const branding: SchoolBrandingSettings = {
    interface_name: trimToNull(input.interface_name),
    logo_hint: trimToNull(input.logo_hint),
    primary_color: trimToNull(input.primary_color),
    secondary_color: trimToNull(input.secondary_color),
    accent_color: trimToNull(input.accent_color),
  }

  return updateSchoolSettingsRecord(context, {
    branding,
  })
}

export async function updateSchoolModuleFlags(
  context: SettingsContext,
  input: UpdateModuleFlagsInput
): Promise<SchoolSettings> {
  const moduleFlags = Object.fromEntries(
    SETTINGS_MODULE_DEFINITIONS.map((item) => [item.key, Boolean(input[item.key])])
  ) as Record<SettingsModuleFlagKey, boolean>

  return updateSchoolSettingsRecord(context, {
    module_flags: moduleFlags,
  })
}
