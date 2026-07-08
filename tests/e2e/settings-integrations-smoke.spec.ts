import { expect, test } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import { assertNoRuntimeErrors } from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

const placeholderWarning =
  "هذه الصفحة مخصصة لإعدادات أولية فقط. لا يتم تنفيذ أي اتصال خارجي في هذه المرحلة."

const settingsRoutes = [
  { href: appRoutes.settings, heading: "الإعدادات" },
  { href: appRoutes.settingsSchool, heading: "إعدادات المدرسة" },
  { href: appRoutes.settingsModules, heading: "الوحدات" },
  { href: appRoutes.settingsTemplates, heading: "القوالب" },
]

const integrationRoutes = [
  { href: appRoutes.integrations, heading: "التكاملات" },
  { href: appRoutes.integrationsWhatsapp, heading: "WhatsApp Business" },
  { href: appRoutes.integrationsWebhooks, heading: "Webhooks" },
]

test("settings smoke", async ({ page }) => {
  await loginAs(page, E2E_USERS.admin)

  for (const route of settingsRoutes) {
    await page.goto(route.href, { waitUntil: "domcontentloaded" })
    await expect(
      page
        .locator("main")
        .getByRole("heading", { name: route.heading, exact: false })
        .first()
    ).toBeVisible()
    await assertNoRuntimeErrors(page)
  }
})

test("integrations smoke", async ({ page }) => {
  await loginAs(page, E2E_USERS.admin)

  for (const route of integrationRoutes) {
    await page.goto(route.href, { waitUntil: "domcontentloaded" })
    await expect(
      page
        .locator("main")
        .getByRole("heading", { name: route.heading, exact: false })
        .first()
    ).toBeVisible()
    await expect(
      page.getByText(placeholderWarning, { exact: false }).first()
    ).toBeVisible()
    await expect(
      page.getByText("لا يتم حفظ مفاتيح API حقيقية في هذه المرحلة.", {
        exact: false,
      }).first()
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "اختبار الاتصال", exact: false })
    ).toHaveCount(0)
    await assertNoRuntimeErrors(page)
  }
})
