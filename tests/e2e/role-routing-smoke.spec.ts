import { expect, test, type Page } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import { assertNoRuntimeErrors } from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

const forbiddenShellCopy = [
  "Supabase Auth",
  "Server Actions",
  "بنية dashboard",
  "مرحلة التأسيس",
]

async function expectNavLinkVisible(page: Page, label: string) {
  await expect(
    page.getByRole("navigation").getByRole("link", { name: label, exact: true })
  ).toBeVisible()
}

async function expectNavLinkHidden(page: Page, label: string) {
  await expect(
    page.getByRole("navigation").getByRole("link", { name: label, exact: true })
  ).toHaveCount(0)
}

test.describe("role-aware routing and navigation smoke", () => {
  test("parent login lands on portal and dashboard redirects back to portal", async ({
    page,
  }) => {
    await loginAs(page, E2E_USERS.parent, appRoutes.portal)
    await page.goto(appRoutes.dashboard)
    await page.waitForURL((url) => url.pathname === appRoutes.portal)
    await expect(
      page.getByRole("heading", { name: "بوابة المتابعة", exact: false })
    ).toBeVisible()
    await assertNoRuntimeErrors(page)
  })

  test("student login lands on portal and dashboard redirects back to portal", async ({
    page,
  }) => {
    await loginAs(page, E2E_USERS.student, appRoutes.portal)
    await page.goto(appRoutes.dashboard)
    await page.waitForURL((url) => url.pathname === appRoutes.portal)
    await expect(
      page.getByRole("heading", { name: "بوابة المتابعة", exact: false })
    ).toBeVisible()
    await assertNoRuntimeErrors(page)
  })

  test("school admin keeps full dashboard navigation and clean shell copy", async ({
    page,
  }) => {
    await loginAs(page, E2E_USERS.admin, appRoutes.dashboard)

    for (const label of [
      "لوحة التحكم",
      "الطلاب",
      "القبول",
      "الأكاديمي",
      "الحضور",
      "الدرجات",
      "الجدول",
      "المالية",
      "التواصل",
      "الشكاوى والاستبيانات",
      "التقارير",
      "المكتبة",
      "الرعاية الطلابية",
      "الإعدادات",
      "التكاملات",
    ]) {
      await expectNavLinkVisible(page, label)
    }

    const body = page.locator("body")

    for (const text of forbiddenShellCopy) {
      await expect(body).not.toContainText(text)
    }

    await assertNoRuntimeErrors(page)
  })

  test("teacher sees teacher-relevant navigation only", async ({ page }) => {
    await loginAs(page, E2E_USERS.teacher, appRoutes.dashboard)

    for (const label of [
      "لوحة التحكم",
      "الحضور",
      "الدرجات",
      "الجدول",
      "التواصل",
      "التقارير",
    ]) {
      await expectNavLinkVisible(page, label)
    }

    for (const label of ["المالية", "الإعدادات", "التكاملات"]) {
      await expectNavLinkHidden(page, label)
    }

    await assertNoRuntimeErrors(page)
  })

  test("accountant lands on dashboard and sees finance-focused navigation", async ({
    page,
  }) => {
    await loginAs(page, E2E_USERS.accountant, appRoutes.dashboard)

    for (const label of ["لوحة التحكم", "المالية", "التواصل", "التقارير"]) {
      await expectNavLinkVisible(page, label)
    }

    for (const label of [
      "القبول",
      "الإعدادات",
      "التكاملات",
      "المكتبة",
      "الرعاية الطلابية",
    ]) {
      await expectNavLinkHidden(page, label)
    }

    await expect(
      page.getByRole("heading", { name: "لوحة المحاسب", exact: true })
    ).toBeVisible()
    await assertNoRuntimeErrors(page)
  })

  test("librarian lands on dashboard and sees library-focused navigation", async ({
    page,
  }) => {
    await loginAs(page, E2E_USERS.librarian, appRoutes.dashboard)

    for (const label of ["لوحة التحكم", "المكتبة", "التواصل", "التقارير"]) {
      await expectNavLinkVisible(page, label)
    }

    for (const label of ["المالية", "الإعدادات", "التكاملات", "الرعاية الطلابية"]) {
      await expectNavLinkHidden(page, label)
    }

    await expect(
      page.getByRole("heading", { name: "لوحة المكتبة", exact: true })
    ).toBeVisible()
    await assertNoRuntimeErrors(page)
  })
})
