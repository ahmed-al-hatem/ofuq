import { expect, test } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import { assertNoRuntimeErrors } from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

const loginCases = [
  {
    name: "school admin",
    email: E2E_USERS.admin,
    destination: appRoutes.dashboard,
    heading: "لوحة التحكم",
  },
  {
    name: "parent portal user",
    email: E2E_USERS.parent,
    destination: appRoutes.portal,
    heading: "بوابة المتابعة",
  },
  {
    name: "student portal user",
    email: E2E_USERS.student,
    destination: appRoutes.portal,
    heading: "بوابة المتابعة",
  },
] as const

test.describe("Auth login smoke", () => {
  for (const loginCase of loginCases) {
    test(`authenticates ${loginCase.name}`, async ({ page }) => {
      await page.goto(appRoutes.login)

      await expect(
        page.getByRole("heading", { name: "تسجيل الدخول إلى أُفُق" })
      ).toBeVisible()

      await loginAs(page, loginCase.email)
      await page.goto(loginCase.destination)

      await expect(
        page.getByRole("heading", { name: loginCase.heading, exact: false })
      ).toBeVisible()
      await expect(page.getByRole("heading", { name: "تسجيل الدخول" })).toHaveCount(0)
      await assertNoRuntimeErrors(page)
    })
  }
})
