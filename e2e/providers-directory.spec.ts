import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { completeCorrugatedWizard } from './helpers/corrugated-wizard'
import { createProviderInDialog, openAddProviderDialog } from './helpers/suppliers'

test.describe('Providers directory QA', () => {
  test.beforeEach(() => {
    test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')
  })

  test('PRV-01 … PRV-06, PRV-10, PRV-11, PRV-05: directory CRUD and RFQ integration', async ({ page }) => {
    test.setTimeout(120_000)
    const stamp = Date.now()
    const name = `E2E Provider ${stamp}`
    const email = `e2e.provider.${stamp}@example.com`
    const secondContactEmail = `e2e.contact2.${stamp}@example.com`

    await createProviderInDialog(page, name, email)
    await expect(page.getByRole('link', { name })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('link', { name }).click()
    await expect(page.getByText('primary').first()).toBeVisible()
    await expect(page.locator('main').getByText(email).first()).toBeVisible()

    await openAddProviderDialog(page)
    await page.getByPlaceholder('Supplier name').fill(`${name} duplicate`)
    await page.getByPlaceholder('sales@supplier.com').fill(email)
    await page.locator('.modal-card').getByRole('button', { name: 'Add supplier' }).click()
    await expect(page.getByText('Supplier email already exists.')).toBeVisible({ timeout: 10_000 })
    await page.keyboard.press('Escape')

    await page.goto('/suppliers')
    await page.getByPlaceholder('Search company, contact or tag').fill(String(stamp))
    await expect(page.getByRole('link', { name })).toBeVisible()
    await page.getByPlaceholder('Search company, contact or tag').fill('zzzz-no-match-qa')
    await expect(page.getByRole('link', { name })).toHaveCount(0)

    await page.getByPlaceholder('Search company, contact or tag').fill(String(stamp))
    await page.getByRole('link', { name }).click()
    await page.getByRole('button', { name: 'Edit' }).click()
    await page.locator('textarea[name="notes"]').fill(`Notes ${stamp}`)
    await page.locator('input[name="tagsInput"]').fill(`tag-${stamp}, qa-tag`)
    await page.locator('form').filter({ has: page.locator('textarea[name="notes"]') }).getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Supplier updated')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(page.getByText(`Notes ${stamp}`)).toBeVisible()
    await expect(page.getByText(`tag-${stamp}`)).toBeVisible()

    await page.getByPlaceholder('Name').fill('Secondary Contact')
    await page.getByPlaceholder('email@supplier.com').fill(secondContactEmail)
    await page.getByRole('button', { name: 'Add contact' }).click()
    await expect(page.getByText('Contact added')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Make primary' }).click()
    await expect(page.getByText('Primary contact updated')).toBeVisible({ timeout: 10_000 })

    const rfqTitle = `RFQ providers ${stamp}`
    await completeCorrugatedWizard(page, rfqTitle)
    await page.getByRole('button', { name: 'Create RFQ' }).click()
    await expect(page).toHaveURL(/\/rfqs\/[0-9a-f-]{36}$/, { timeout: 20_000 })
    const rfqUrl = page.url()

    await page.getByRole('button', { name: /Suppliers/i }).click()
    await page.getByRole('button', { name: 'Add suppliers' }).click()
    await page.getByRole('button', { name }).click()
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 })

    const adHocEmail = `adhoc.${stamp}@example.com`
    await page.getByPlaceholder('Supplier name').fill('Ad hoc Supplier')
    await page.getByPlaceholder('email@supplier.com').fill(adHocEmail)
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(page.getByText(adHocEmail)).toBeVisible({ timeout: 15_000 })

    await page.goto(`/suppliers`)
    await page.getByPlaceholder('Search company, contact or tag').fill(String(stamp))
    await page.getByRole('link', { name }).click()
    await page.getByRole('button', { name: 'Archive' }).click()
    await expect(page.getByText('Archived')).toBeVisible({ timeout: 10_000 })

    await page.goto(rfqUrl)
    await page.getByRole('button', { name: /Suppliers/i }).click()
    await page.getByRole('button', { name: 'Add suppliers' }).click()
    await expect(page.getByRole('button', { name })).toHaveCount(0)
  })

  test('PRV-20: unknown provider id shows not found (same-tenant)', async ({ page }) => {
    await gotoAuthenticated(page, '/suppliers/00000000-0000-4000-8000-000000000099')
    await expect(page.getByText('Supplier not found')).toBeVisible({ timeout: 15_000 })
  })
})
