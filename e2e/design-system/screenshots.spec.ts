import path from 'path'
import { fileURLToPath } from 'url'
import { expect, test, type Page } from '@playwright/test'
import { demoCredentials, gotoAuthenticatedDemo, loginAsDemo } from '../helpers/auth'

/**
 * Captures docs/screenshots at 1440px in light and dark from the demo workspace
 * (Backend/scripts/seed_demo.py). Logs in as DEMO_EMAIL, never the E2E buyer.
 * Opt-in: QUOLY_SCREENSHOTS=1 npx playwright test screenshots
 */
const enabled = process.env.QUOLY_SCREENSHOTS === '1'
const only = process.env.QUOLY_SCREENSHOTS_ONLY?.split(',').filter(Boolean)
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs/screenshots')

test.describe('Screenshots', () => {
  test.skip(!enabled, 'Set QUOLY_SCREENSHOTS=1 to capture docs screenshots')
  test.skip(!demoCredentials(), 'Set DEMO_EMAIL and DEMO_PASSWORD in Frontend/.env.demo.local')
  test.use({
    viewport: { width: 1440, height: 900 },
    storageState: { cookies: [], origins: [] },
  })
  test.setTimeout(180_000)

  async function requestId(page: Page, name: string): Promise<string> {
    await gotoAuthenticatedDemo(page, '/requests')
    const link = page.getByRole('main').getByRole('link', { name: new RegExp(name) }).first()
    await expect(link).toBeVisible({ timeout: 20_000 })
    const href = await link.getAttribute('href')
    const id = href?.match(/rfqs\/([^/?#]+)/)?.[1]
    if (!id) throw new Error(`No request link for ${name}`)
    return id
  }

  async function capture(page: Page, name: string, url: string, ready: (page: Page) => Promise<void>) {
    if (only && !only.includes(name)) return
    for (const theme of ['light', 'dark'] as const) {
      await page.addInitScript((value) => window.localStorage.setItem('quoly_theme', value), theme)
      await gotoAuthenticatedDemo(page, url)
      await ready(page)
      await page.waitForTimeout(600)
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      await page.setViewportSize({ width: 1440, height: Math.max(900, height) })
      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(outDir, `${name}-${theme}.png`) })
      await page.setViewportSize({ width: 1440, height: 900 })
    }
  }

  async function quoteId(page: Page, rfqId: string, supplier: string): Promise<string> {
    const quotes = await page.evaluate(async (id) => {
      const res = await fetch(`http://localhost:8000/api/v1/rfqs/${id}/quotes`, {
        headers: { Authorization: `Bearer ${window.localStorage.getItem('quoly_token')}` },
      })
      return (await res.json()) as Array<{ id: string, supplier_name: string }>
    }, rfqId)
    const match = quotes.find(quote => quote.supplier_name === supplier)
    if (!match) throw new Error(`No quote from ${supplier}`)
    return match.id
  }

  test('demo workspace', async ({ page }) => {
    await loginAsDemo(page)
    const snack = await requestId(page, 'Snack line shipper box')
    const trays = await requestId(page, 'Corrugated trays for produce')

    await capture(page, 'comparison', `/rfqs/${snack}/comparison`, async (p) => {
      await expect(p.getByRole('table', { name: 'By supplier' })).toBeVisible({ timeout: 60_000 })
    })
    await capture(page, 'comparison-decided', `/rfqs/${trays}/comparison`, async (p) => {
      await expect(p.getByRole('table', { name: 'By supplier' })).toBeVisible({ timeout: 60_000 })
    })
    const ondulado = await quoteId(page, snack, 'Grupo Ondulado Occidente')
    await capture(page, 'quote-review', `/quotes/${ondulado}`, async (p) => {
      await expect(p.getByRole('heading', { name: 'Quote review', exact: true })).toBeVisible({ timeout: 30_000 })
      await p.locator('.qr-snippet').first().click()
    })
    const norte = await quoteId(page, snack, 'Cartonajes del Norte')
    await capture(page, 'quote-review-usd', `/quotes/${norte}`, async (p) => {
      await expect(p.getByRole('heading', { name: 'Quote review', exact: true })).toBeVisible({ timeout: 30_000 })
    })
    await capture(page, 'dashboard', '/', async (p) => {
      await expect(p.getByTestId('home-greeting')).toBeVisible({ timeout: 30_000 })
      await expect(p.locator('.qy-skel')).toHaveCount(0, { timeout: 30_000 })
      await expect(p.getByText('Open requests')).toBeVisible()
      await expect(p.getByRole('heading', { name: 'Pipeline' })).toBeVisible()
      await expect(p.getByRole('heading', { name: 'Waiting on you' })).toBeVisible()
      await expect(p.locator('.rq-kpi-value').first()).toBeVisible()
    })
    await capture(page, 'requests', '/requests', async (p) => {
      await expect(p.locator('.qy-skel')).toHaveCount(0, { timeout: 30_000 })
      await expect(p.getByRole('main').getByText('Snack line shipper box').first()).toBeVisible({ timeout: 30_000 })
      await expect(p.getByText(/Quotation UI|Tier Co/)).toHaveCount(0)
    })
    await capture(page, 'request-detail', `/rfqs/${snack}`, async (p) => {
      await expect(p.getByRole('heading', { name: 'Snack line shipper box' })).toBeVisible({ timeout: 30_000 })
    })
    await capture(page, 'quotations', '/quotations', async (p) => {
      await expect(p.locator('.qy-skel')).toHaveCount(0, { timeout: 30_000 })
      await expect(p.getByRole('main').getByText('Empaques Bajío').first()).toBeVisible({ timeout: 30_000 })
      await expect(p.getByText(/Quotation UI|Tier Co/)).toHaveCount(0)
    })
    await capture(page, 'request-form', '/rfqs/new', async (p) => {
      await expect(p.getByRole('main').locator('form')).toBeVisible({ timeout: 30_000 })
    })
  })
})
