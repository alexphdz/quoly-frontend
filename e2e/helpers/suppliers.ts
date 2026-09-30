import { expect, type Page } from '@playwright/test'

export async function openAddProviderDialog(page: Page) {
  await page.goto('/suppliers')
  await expect(page.getByRole('heading', { name: 'Suppliers' })).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Add supplier' }).click()
  await expect(page.getByRole('heading', { name: 'Add supplier' })).toBeVisible()
}

export async function createProviderInDialog(
  page: Page,
  displayName: string,
  primaryEmail: string,
) {
  await openAddProviderDialog(page)
  await page.getByPlaceholder('Supplier name').fill(displayName)
  await page.getByPlaceholder('sales@supplier.com').fill(primaryEmail)
  await page.locator('.ds-add-panel form').getByRole('button', { name: 'Add supplier' }).click()
  await expect(page.getByText('Supplier created')).toBeVisible({ timeout: 15_000 })
}
