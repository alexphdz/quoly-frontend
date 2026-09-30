import { expect, type Page } from '@playwright/test'
import { gotoAuthenticated } from './auth'

/** Fill minimum required fields and advance through the 9-step corrugated wizard (stops on Review). */
export async function completeCorrugatedWizard(page: Page, title: string) {
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 14)
  const deadlineStr = deadline.toISOString().slice(0, 10)

  await gotoAuthenticated(page, '/rfqs/new')
  await expect(page.getByRole('heading', { name: 'New corrugated RFQ' })).toBeVisible({ timeout: 15_000 })

  await page.locator('input[name="name"]').fill(title)
  await page.locator('textarea[name="description"]').fill('E2E test shipper for QA')
  await page.locator('input[name="response_deadline"]').fill(deadlineStr)
  await page.locator('input[name="delivery_point"]').fill('Monterrey, MX')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('input[name="product_name"]').fill('SKU-E2E-001')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('input[name="strength_target_value"]').fill('32')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('input[name="length"]').fill('400')
  await page.locator('input[name="width"]').fill('300')
  await page.locator('input[name="height"]').fill('200')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByRole('button', { name: 'Next' }).click()

  await page.locator('input[name="volume_tiers.0.label"]').fill('Launch')
  await page.locator('input[name="volume_tiers.0.quantity"]').fill('20000')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('button', { name: 'Create RFQ' })).toBeVisible()
}

export async function fillCorrugatedHeaderMinimum(page: Page, title: string) {
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 14)
  const deadlineStr = deadline.toISOString().slice(0, 10)

  await page.locator('input[name="name"]').fill(title)
  await page.locator('textarea[name="description"]').fill('E2E header only')
  await page.locator('input[name="response_deadline"]').fill(deadlineStr)
  await page.locator('input[name="delivery_point"]').fill('Monterrey, MX')
}
