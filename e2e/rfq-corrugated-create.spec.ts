import { test, expect } from '@playwright/test'
import { e2eCredentials } from './helpers/auth'
import { completeCorrugatedWizard } from './helpers/corrugated-wizard'

test.beforeEach(() => {
  test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')
})

test.describe('RFQ corrugated create', () => {
  test('CRE-01: create RFQ and land on detail without error', async ({ page }) => {
    const title = `E2E RFQ ${Date.now()}`
    await completeCorrugatedWizard(page, title)

    await page.getByRole('button', { name: 'Create RFQ' }).click()

    await expect(page).toHaveURL(/\/rfqs\/[0-9a-f-]{36}$/, { timeout: 20_000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
    await expect(page.getByText('Unexpected Application Error')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Overview/i })).toBeVisible()
  })

  test('CRE-04: new RFQ appears on dashboard', async ({ page }) => {
    const title = `E2E Dash ${Date.now()}`
    await completeCorrugatedWizard(page, title)
    const createResponse = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/v1/rfqs') && r.ok(),
      { timeout: 20_000 },
    )
    await page.getByRole('button', { name: 'Create RFQ' }).click()
    await createResponse
    await expect(page).toHaveURL(/\/rfqs\//, { timeout: 20_000 })

    await page.goto('/')
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/v1/rfqs') && resp.request().method() === 'GET' && resp.ok(),
      { timeout: 20_000 },
    )
    const search = page.getByPlaceholder('Search RFQ name or number')
    await search.fill(title)
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible({ timeout: 15_000 })
  })
})
