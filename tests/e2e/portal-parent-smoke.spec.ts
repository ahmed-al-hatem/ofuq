import { expect, test } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import {
  assertDashboardNavigationHidden,
  assertNoRuntimeErrors,
  assertPortalReadOnly,
} from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

const parentPortalRoutes = [
  { path: appRoutes.portal, heading: "بوابة المتابعة" },
  { path: appRoutes.portalStudents, heading: "الأبناء" },
  { path: appRoutes.portalAttendance, heading: "الحضور" },
  { path: appRoutes.portalGrades, heading: "الدرجات" },
  { path: appRoutes.portalFinance, heading: "المالية" },
  { path: appRoutes.portalAnnouncements, heading: "الإعلانات" },
] as const

test("parent portal smoke remains read-only", async ({ page }) => {
  test.setTimeout(120_000)
  await loginAs(page, E2E_USERS.parent, appRoutes.portal)
  const main = page.getByRole("main")
  const navigation = page.getByRole("navigation")

  for (const route of parentPortalRoutes) {
    await page.goto(route.path)
    await expect(
      main.getByRole("heading", { name: route.heading, exact: true })
    ).toBeVisible()
    await expect(navigation.getByRole("link", { name: "الرئيسية", exact: true })).toBeVisible()
    await expect(
      navigation.getByRole("link", { name: "الأبناء / بياناتي", exact: true })
    ).toBeVisible()
    await assertPortalReadOnly(page)
    await assertDashboardNavigationHidden(page)
    await assertNoRuntimeErrors(page)
  }
})
