import { expect, type Page } from "@playwright/test"

const runtimeErrorPatterns = [
  "Application error",
  "Unhandled Runtime Error",
  "This page could not be found",
]

const portalMutationLabels = ["دفع", "تعديل", "حذف", "إرسال عذر", "إنشاء", "جديد"]

const dashboardOnlyLabels = [
  "القبول",
  "الأكاديمي",
  "التواصل",
  "التقارير",
  "الشكاوى والاستبيانات",
]

export async function assertNoRuntimeErrors(page: Page): Promise<void> {
  const body = page.locator("body")

  for (const pattern of runtimeErrorPatterns) {
    await expect(body).not.toContainText(pattern)
  }
}

export async function assertPortalReadOnly(page: Page): Promise<void> {
  await expect(page.getByRole("banner").getByText("عرض فقط")).toBeVisible()

  for (const label of portalMutationLabels) {
    await expect(page.getByRole("button", { name: label, exact: false })).toHaveCount(0)
    await expect(page.getByRole("link", { name: label, exact: false })).toHaveCount(0)
  }
}

export async function assertDashboardNavigationHidden(page: Page): Promise<void> {
  const navigation = page.getByRole("navigation")

  for (const label of dashboardOnlyLabels) {
    await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveCount(0)
  }
}
