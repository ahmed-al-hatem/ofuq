import { expect, test } from "@playwright/test"

import { appRoutes } from "../../constants/routes"
import { assertNoRuntimeErrors } from "./helpers/assertions"
import { E2E_USERS, loginAs } from "./helpers/auth"

test("school admin sees the administrative dashboard", async ({ page }) => {
  await loginAs(page, E2E_USERS.admin)
  await page.goto(appRoutes.dashboard)

  await expect(
    page.getByRole("heading", { name: "لوحة تشغيل المدرسة", exact: false })
  ).toBeVisible()
  await expect(page.getByText("ملفات الطلاب")).toBeVisible()
  await assertNoRuntimeErrors(page)
})

test("teacher sees the teaching dashboard without finance or settings navigation", async ({
  page,
}) => {
  await loginAs(page, E2E_USERS.teacher)
  await page.goto(appRoutes.dashboard)
  const navigation = page.getByRole("navigation")

  await expect(page.getByRole("heading", { name: "لوحة المعلم" })).toBeVisible()
  await expect(page.getByText("إدخال الدرجات")).toBeVisible()
  await expect(navigation.getByRole("link", { name: "المالية", exact: true })).toHaveCount(0)
  await expect(navigation.getByRole("link", { name: "الإعدادات", exact: true })).toHaveCount(0)
  await expect(navigation.getByRole("link", { name: "التكاملات", exact: true })).toHaveCount(0)
  await assertNoRuntimeErrors(page)
})

test("accountant sees the finance dashboard quick actions only", async ({ page }) => {
  await loginAs(page, E2E_USERS.accountant)
  await page.goto(appRoutes.dashboard)

  await expect(page.getByRole("heading", { name: "لوحة المحاسب" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "الفواتير", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "المدفوعات", exact: true })
  ).toBeVisible()
  await expect(page.getByText("الإعارات")).toHaveCount(0)
  await expect(page.getByText("إدخال الدرجات")).toHaveCount(0)
  await assertNoRuntimeErrors(page)
})

test("librarian sees the library dashboard quick actions only", async ({ page }) => {
  await loginAs(page, E2E_USERS.librarian)
  await page.goto(appRoutes.dashboard)

  await expect(page.getByRole("heading", { name: "لوحة المكتبة" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "فهرس الكتب", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "الإعارات", exact: true })
  ).toBeVisible()
  await expect(page.getByText("الفواتير")).toHaveCount(0)
  await assertNoRuntimeErrors(page)
})

test("parent sees the children-focused portal overview", async ({ page }) => {
  await loginAs(page, E2E_USERS.parent, appRoutes.portal)
  await page.goto(appRoutes.portal)

  await expect(page.getByRole("heading", { name: "بوابة المتابعة" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "الأبناء المرتبطون" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "ملخص الفواتير" })).toBeVisible()
  await assertNoRuntimeErrors(page)
})

test("student sees the personal portal overview", async ({ page }) => {
  await loginAs(page, E2E_USERS.student, appRoutes.portal)
  await page.goto(appRoutes.portal)

  await expect(page.getByRole("heading", { name: "بوابة المتابعة" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "جدولي القريب" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "كتبي المستعارة" })).toBeVisible()
  await assertNoRuntimeErrors(page)
})
