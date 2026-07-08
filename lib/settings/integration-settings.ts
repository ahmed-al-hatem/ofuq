import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { INTEGRATION_PROVIDER_DEFINITIONS } from "@/lib/settings/constants"
import type { SettingsContext } from "@/lib/settings/context"
import type { Json } from "@/types/database"
import type {
  IntegrationProvider,
  IntegrationSetting,
  IntegrationStatus,
} from "@/types/settings"

export type IntegrationSettingView = Omit<IntegrationSetting, "settings"> & {
  settings: Record<string, Json>
  persisted: boolean
}

function getSettingsObject(value: Json | null | undefined): Record<string, Json> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {}
}

function buildPlaceholderIntegrationSetting(
  context: SettingsContext,
  definition: (typeof INTEGRATION_PROVIDER_DEFINITIONS)[number]
): IntegrationSettingView {
  return {
    id: `placeholder-${definition.provider}`,
    tenant_id: context.tenant_id,
    school_id: context.school_id,
    provider: definition.provider,
    display_name: definition.displayName,
    status: "placeholder" satisfies IntegrationStatus,
    enabled: false,
    settings: {},
    last_checked_at: null,
    updated_by_user_id: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    persisted: false,
  }
}

export async function listIntegrationSettings(
  context: SettingsContext
): Promise<IntegrationSettingView[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("integration_settings")
    .select("*")
    .eq("tenant_id", context.tenant_id)
    .eq("school_id", context.school_id)

  if (error || !data) {
    return INTEGRATION_PROVIDER_DEFINITIONS.map((definition) =>
      buildPlaceholderIntegrationSetting(context, definition)
    )
  }

  const storedByProvider = new Map(
    data.map((record) => [
      record.provider,
      {
        ...record,
        settings: getSettingsObject(record.settings),
        persisted: true,
      },
    ])
  )

  return INTEGRATION_PROVIDER_DEFINITIONS.map(
    (definition) =>
      storedByProvider.get(definition.provider) ??
      buildPlaceholderIntegrationSetting(context, definition)
  )
}

export async function listIntegrationSettingsForProviders(
  context: SettingsContext,
  providers: readonly IntegrationProvider[]
): Promise<IntegrationSettingView[]> {
  const settings = await listIntegrationSettings(context)

  return settings.filter((setting) => providers.includes(setting.provider))
}

export async function getIntegrationSettingByProvider(
  context: SettingsContext,
  provider: IntegrationProvider
): Promise<IntegrationSettingView> {
  const settings = await listIntegrationSettingsForProviders(context, [provider])

  return (
    settings[0] ??
    buildPlaceholderIntegrationSetting(
      context,
      INTEGRATION_PROVIDER_DEFINITIONS.find((item) => item.provider === provider)!
    )
  )
}
