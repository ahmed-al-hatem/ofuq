import { expect, type Page } from "@playwright/test"

import { appRoutes } from "../../../constants/routes"

const defaultPassword = process.env.E2E_PASSWORD ?? "OfuqLocal123!"

export const E2E_USERS = {
  admin: "school.admin@ofuq.local",
  teacher: "teacher.arabic@ofuq.local",
  accountant: "accountant.main@ofuq.local",
  librarian: "librarian.main@ofuq.local",
  parent: "parent.hassan@ofuq.local",
  student: "student.youssef@ofuq.local",
} as const

export async function loginAs(
  page: Page,
  email: string,
  expectedPath = appRoutes.dashboard
): Promise<void> {
  await page.goto(appRoutes.login)

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible()
    await expect(page.getByLabel("كلمة المرور")).toBeVisible()
    await page.getByLabel("البريد الإلكتروني").fill(email)
    await page.getByLabel("كلمة المرور").fill(defaultPassword)
    await page.getByRole("button", { name: "الدخول إلى لوحة التحكم" }).click()

    try {
      await page.waitForURL((url) => url.pathname === expectedPath, {
        timeout: 90_000,
        waitUntil: "domcontentloaded",
      })
      break
    } catch (error) {
      const alert = page.getByRole("alert")
      const alertText = (await alert.textContent().catch(() => null))?.trim()

      if (
        attempt === 2 ||
        alertText !== "حدث خطأ غير متوقع، حاول مرة أخرى"
      ) {
        throw error
      }

      await page.goto(appRoutes.login)
    }
  }

  await expect(page.getByLabel("البريد الإلكتروني")).toHaveCount(0)
}

export async function logoutIfPossible(page: Page): Promise<void> {
  const signOutButton = page.getByRole("button", { name: "تسجيل الخروج" })

  if (await signOutButton.count()) {
    await signOutButton.click()
    await page.waitForURL(`**${appRoutes.login}`)
  }
}
