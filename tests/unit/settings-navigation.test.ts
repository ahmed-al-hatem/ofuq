import { dashboardNavigation } from "@/config/navigation"
import { appRoutes } from "@/constants/routes"

describe("settings navigation entries", () => {
  const allItems = dashboardNavigation.flatMap((group) => group.items)

  it("activates settings and integrations instead of leaving them as placeholders", () => {
    const settingsItem = allItems.find((item) => item.label === "الإعدادات")
    const integrationsItem = allItems.find((item) => item.label === "التكاملات")

    expect(settingsItem).toBeDefined()
    expect(settingsItem?.href).toBe(appRoutes.settings)
    expect(settingsItem?.placeholder).toBeUndefined()

    expect(integrationsItem).toBeDefined()
    expect(integrationsItem?.href).toBe(appRoutes.integrations)
    expect(integrationsItem?.placeholder).toBeUndefined()
  })
})
