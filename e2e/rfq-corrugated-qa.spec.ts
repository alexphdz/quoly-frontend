import { test, expect } from '@playwright/test'
import { pickOption } from './helpers/select'
import { e2eCredentials, gotoAuthenticated, loginAsBuyer } from './helpers/auth'
import { completeCorrugatedWizard, fillCorrugatedHeaderMinimum } from './helpers/corrugated-wizard'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('RFQ corrugated QA — auth & access', () => {
  test.describe('unauthenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test('AUTH-01: unauthenticated redirect from wizard', async ({ page }) => {
      skipNoCreds()
      await page.goto('/rfqs/new')
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    })
  })

  test('AUTH-02 / AUTH-03: login and open wizard from dashboard', async ({ page }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/rfqs/new')
    await expect(page).toHaveURL('/rfqs/new')
    await expect(page.getByRole('heading', { name: 'New corrugated RFQ' })).toBeVisible()
    await expect(page.getByText('Step 1 of 9')).toBeVisible()
  })
})

test.describe('RFQ corrugated QA — navigation & validation', () => {
  test.beforeEach(async ({ page }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/rfqs/new')
    await expect(page.getByRole('heading', { name: 'New corrugated RFQ' })).toBeVisible({ timeout: 15_000 })
  })

  test('NAV-01: Next without required fields shows step warning', async ({ page }) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.getByText('Fix the highlighted fields before continuing')).toBeVisible()
    await expect(page.getByText('Step 1 of 9')).toBeVisible()
  })

  test('NAV-02: forward and back retain header values', async ({ page }) => {
    const title = `NAV retain ${Date.now()}`
    await fillCorrugatedHeaderMinimum(page, title)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Step 2 of 9')).toBeVisible()
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.locator('input[name="name"]')).toHaveValue(title)
  })

  test('NAV-03: jump via step list without validating intermediate steps', async ({ page }) => {
    await fillCorrugatedHeaderMinimum(page, `Jump ${Date.now()}`)
    await page.getByRole('button', { name: '6. Volume tiers' }).click()
    await expect(page.getByText('Step 6 of 9')).toBeVisible()
  })

  test('NAV-04: legacy form link', async ({ page }) => {
    await page.getByRole('link', { name: 'Use legacy generic form' }).click()
    await expect(page).toHaveURL('/rfqs/new/legacy')
    await expect(page.getByRole('heading', { name: 'Create RFQ' })).toBeVisible()
  })

  test('VAL-01: incoterm requires named place', async ({ page }) => {
    await fillCorrugatedHeaderMinimum(page, `Incoterm ${Date.now()}`)
    await pickOption(page, 'default_incoterm', 'FOB')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Fix the highlighted fields before continuing')).toBeVisible()
  })

  test('VAL-02: empty strength target blocks board step', async ({ page }) => {
    await fillCorrugatedHeaderMinimum(page, `Strength ${Date.now()}`)
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('input[name="product_name"]').fill('SKU-VAL')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('input[name="strength_target_value"]').fill('')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Fix the highlighted fields before continuing')).toBeVisible()
    await expect(page.getByText('Step 3 of 9')).toBeVisible()
  })

  test('VAL-03: volume tier quantity zero blocks advance', async ({ page }) => {
    await fillCorrugatedHeaderMinimum(page, `Tiers ${Date.now()}`)
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('input[name="product_name"]').fill('SKU-TIER')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('input[name="strength_target_value"]').fill('32')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('input[name="length"]').fill('400')
    await page.locator('input[name="width"]').fill('300')
    await page.locator('input[name="height"]').fill('200')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.locator('input[name="volume_tiers.0.label"]').fill('Launch')
    await page.locator('input[name="volume_tiers.0.quantity"]').fill('0')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Step 6 of 9')).toBeVisible()
    await expect(page.getByText('Step 7 of 9')).toHaveCount(0)
  })
})

test.describe('RFQ corrugated QA — create & draft', () => {
  test.beforeEach(() => {
    skipNoCreds()
  })

  test('CRE-02 / CRE-03: detail overview and refresh persistence', async ({ page }) => {
    const title = `CRE detail ${Date.now()}`
    await completeCorrugatedWizard(page, title)
    await page.getByRole('button', { name: 'Create RFQ' }).click()
    await expect(page).toHaveURL(/\/rfqs\/[0-9a-f-]{36}$/, { timeout: 20_000 })

    await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
    await expect(page.getByText('E2E test shipper for QA')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Reply address' })).toBeVisible()

    const url = page.url()
    await page.reload()
    await expect(page).toHaveURL(url)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
  })

  test('DRF-01: save draft with title shows success toast', async ({ page }) => {
    await gotoAuthenticated(page, '/rfqs/new')
    await fillCorrugatedHeaderMinimum(page, `Draft ${Date.now()}`)
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByText('Draft saved')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByText('Draft saved')).toBeVisible({ timeout: 15_000 })
  })

  test('DRF-02: save draft without title stays on step 1', async ({ page }) => {
    await gotoAuthenticated(page, '/rfqs/new')
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByText('Step 1 of 9')).toBeVisible()
    await expect(page.getByText('Required').first()).toBeVisible()
  })
})

test.describe('RFQ corrugated QA — API errors', () => {
  test.beforeEach(() => {
    skipNoCreds()
  })

  test('API-01: expired session shows error without full-page reload on draft save', async ({ page }) => {
    await gotoAuthenticated(page, '/rfqs/new')
    await expect(page.getByRole('heading', { name: 'New corrugated RFQ' })).toBeVisible()
    await fillCorrugatedHeaderMinimum(page, `Session ${Date.now()}`)
    await page.evaluate(() => localStorage.removeItem('quoly_token'))
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL('/rfqs/new')
  })

  test('API-03: network failure shows reachable API message on create', async ({ page }) => {
    await page.route('**/api/v1/rfqs**', route => route.abort())
    const title = `Net fail ${Date.now()}`
    await completeCorrugatedWizard(page, title)
    await page.getByRole('button', { name: 'Create RFQ' }).click()
    await expect(page.getByText(/Can't reach Quoly|network/i)).toBeVisible({ timeout: 15_000 })
  })
})
