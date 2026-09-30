import type { Page } from '@playwright/test'

/** Choose an option in a form SelectInput (Radix Select) by field name and option value. */
export async function pickOption(page: Page, name: string, value: string) {
  await page.locator(`[data-name="${name}"]`).click()
  await page.locator(`[role="option"][data-option-value="${value}"]`).click()
}
