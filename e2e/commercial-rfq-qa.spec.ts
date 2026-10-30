import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('Commercial RFQ QA (module 1)', () => {
  test('CR-01: create open request, draft edit, detail shows commercial facts', async ({ page }) => {
    skipNoCreds()
    const stamp = Date.now()
    const product = `E2E Citric ${stamp}`

    await gotoAuthenticated(page, '/rfqs/new')
    await expect(page.getByRole('heading', { name: 'New request' })).toBeVisible()

    await page.locator('input[name="name"]').fill(product)
    await page.locator('input[name="quantity"]').fill('1200')
    await page.locator('select[name="base_unit"]').selectOption('kg')
    await page.locator('textarea[name="technical_requirements"]').fill('Food grade, assay 99.5% minimum.')

    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page).toHaveURL(/\/rfqs\/[a-f0-9-]+/, { timeout: 20_000 })
    await expect(page.getByRole('heading', { name: product })).toBeVisible()

    await page.getByRole('button', { name: 'Edit request' }).click()
    await expect(page.getByRole('heading', { name: 'Edit request' })).toBeVisible()
    await page.locator('input[name="quantity"]').fill('1500')
    await page.getByRole('button', { name: 'Create request' }).click()
    await expect(page.getByRole('heading', { name: product })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/1,500 kg/)).toHaveCount(2)
    await expect(page.getByText(/Food grade/i).first()).toBeVisible()
  })
})
