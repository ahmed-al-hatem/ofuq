import { INTEGRATION_PROVIDER_DEFINITIONS } from "@/lib/settings/constants"
import {
  INTEGRATION_PROVIDER_LABELS_AR,
  INTEGRATION_STATUS_LABELS_AR,
} from "@/types/settings"

describe("integration settings constants", () => {
  it("keeps the provider list stable and unique", () => {
    const providers = INTEGRATION_PROVIDER_DEFINITIONS.map(
      (item) => item.provider
    )

    expect(providers).toEqual([
      "whatsapp",
      "webhooks",
      "moe",
      "google_calendar",
      "microsoft_calendar",
      "power_bi",
      "looker",
      "zapier",
      "make",
    ])
    expect(new Set(providers).size).toBe(providers.length)
  })

  it("keeps Arabic provider labels non-empty", () => {
    for (const definition of INTEGRATION_PROVIDER_DEFINITIONS) {
      expect(definition.label.trim().length).toBeGreaterThan(0)
      expect(
        INTEGRATION_PROVIDER_LABELS_AR[definition.provider].trim().length
      ).toBeGreaterThan(0)
    }
  })

  it("keeps placeholder statuses explicit by default", () => {
    expect(INTEGRATION_STATUS_LABELS_AR.placeholder).toBe("إعدادات فقط")
    expect(INTEGRATION_STATUS_LABELS_AR.disabled).toBe("غير مفعّل")
  })

  it("does not mark any provider as connected by default", () => {
    for (const definition of INTEGRATION_PROVIDER_DEFINITIONS) {
      expect(definition.href.startsWith("/dashboard/integrations")).toBe(true)
      expect(definition.summary.includes("متصل")).toBe(false)
      expect(definition.summary.includes("جاهز")).toBe(false)
    }
  })
})
