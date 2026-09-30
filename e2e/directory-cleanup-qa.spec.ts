import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { createProviderInDialog } from './helpers/suppliers'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('Directory cleanup QA (module 8)', () => {
  test('DIR-01: supplier directory uses tags only (no packaging types)', async ({ page }) => {
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/suppliers')
    await expect(page.getByRole('heading', { name: 'Suppliers', exact: true })).toBeVisible()
    await expect(page.getByText('Packaging types')).toHaveCount(0)

    const name = `E2E Supplier ${stamp}`
    const email = `e2e.supplier.${stamp}@example.com`
    await createProviderInDialog(page, name, email)
    await page.getByRole('link', { name }).click()
    await page.getByRole('button', { name: 'Edit' }).click()
    await page.locator('input[name="tagsInput"]').fill(`dir-qa-${stamp}`)
    await page.locator('form').filter({ has: page.locator('input[name="tagsInput"]') }).getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Supplier updated')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(`dir-qa-${stamp}`)).toBeVisible()
  })
})
