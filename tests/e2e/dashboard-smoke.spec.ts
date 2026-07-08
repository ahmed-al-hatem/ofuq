import { expect, test } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import { assertNoRuntimeErrors } from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

const dashboardLabels = ["الطلاب", "الأكاديمي", "الحضور", "الدرجات", "المالية"]

test("admin dashboard smoke", async ({ page }) => {
  await loginAs(page, E2E_USERS.admin)
  await page.goto(appRoutes.dashboard)
  const navigation = page.getByRole("navigation")

  await expect(
    page.getByRole("heading", { name: "لوحة التحكم", exact: false })
  ).toBeVisible()

  for (const label of dashboardLabels) {
    await expect(navigation.getByRole("link", { name: label, exact: true })).toBeVisible()
  }

  await assertNoRuntimeErrors(page)
})
