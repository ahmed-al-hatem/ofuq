import { appRoutes } from "@/constants/routes"

describe("settings and integrations routes", () => {
  it("exposes stable settings routes", () => {
    const routes = [
      appRoutes.settings,
      appRoutes.settingsSchool,
      appRoutes.settingsBranding,
      appRoutes.settingsLocalization,
      appRoutes.settingsModules,
      appRoutes.settingsTemplates,
    ]

    expect(routes.every((route) => route.startsWith("/dashboard/settings"))).toBe(
      true
    )
    expect(new Set(routes).size).toBe(routes.length)
  })

  it("exposes stable integrations routes", () => {
    const routes = [
      appRoutes.integrations,
      appRoutes.integrationsWhatsapp,
      appRoutes.integrationsWebhooks,
      appRoutes.integrationsMoe,
      appRoutes.integrationsCalendar,
      appRoutes.integrationsBi,
      appRoutes.integrationsAutomation,
    ]

    expect(
      routes.every((route) => route.startsWith("/dashboard/integrations"))
    ).toBe(true)
    expect(new Set(routes).size).toBe(routes.length)
  })
})
