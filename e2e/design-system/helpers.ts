import { expect, type Page } from '@playwright/test'

export async function waitForPageData(page: Page) {
  await expect(page.locator('.skeleton, .qy-skel')).toHaveCount(0, { timeout: 45_000 })
}
