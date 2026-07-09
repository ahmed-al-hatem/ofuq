import { expect, test } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import {
  assertDashboardNavigationHidden,
  assertNoRuntimeErrors,
  assertPortalReadOnly,
} from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

const studentPortalRoutes = [
  { path: appRoutes.portal, heading: "بوابة المتابعة" },
  { path: appRoutes.portalStudents, heading: "بياناتي" },
  { path: appRoutes.portalGrades, heading: "الدرجات" },
  { path: appRoutes.portalTimetable, heading: "الجدول" },
  { path: appRoutes.portalLibrary, heading: "المكتبة" },
  { path: appRoutes.portalFinance, heading: "المالية" },
] as const

test("student portal smoke remains read-only", async ({ page }) => {
  test.setTimeout(120_000)
  await loginAs(page, E2E_USERS.student, appRoutes.portal)
  const main = page.getByRole("main")

  for (const route of studentPortalRoutes) {
    await page.goto(route.path)
    await expect(
      main.getByRole("heading", { name: route.heading, exact: true })
    ).toBeVisible()
    await assertPortalReadOnly(page)
    await assertDashboardNavigationHidden(page)
    await assertNoRuntimeErrors(page)
  }

  await expect(page.getByText("عرض مالي محدود")).toBeVisible()
})
