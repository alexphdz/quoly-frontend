import path from 'path'
import { fileURLToPath } from 'url'
import { expect, test } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'

const enabled = process.env.QUOLY_MODULE_SHOTS === '1'
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs/screenshots')

test.describe('Module screenshots', () => {
  test.skip(!enabled, 'Set QUOLY_MODULE_SHOTS=1')
  test.skip(!e2eCredentials(), 'E2E credentials required')
  test.use({ viewport: { width: 1440, height: 900 } })
  test.setTimeout(120_000)

  test('review queue and supplier questions', async ({ page }) => {
    await gotoAuthenticated(page, '/quotations')
    await expect(page.getByText('Review queue')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('.qy-skel')).toHaveCount(0)
    await expect(page.locator('.rq-queue-row')).toHaveCount(5, { timeout: 20_000 })
    await expect(page.locator('.rq-queue-meta').filter({ hasText: /due |overdue/i }).first()).toBeVisible()
    await page.evaluate(() => {
      const hide = /Quotation (UI|QA)|Spec QA/
      document.querySelectorAll('.rq-queue-list li, .qt-table tbody tr').forEach((row) => {
        if (hide.test(row.textContent || '')) row.remove()
      })
    })
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(outDir, 'quotations-review-queue-light.png') })

    await page.goto('/requests')
    await page.getByPlaceholder(/Search product/).fill('Stretch film')
    const film = page.getByRole('main').getByRole('link', { name: /Stretch film for pallet wrap/ }).first()
    await expect(film).toBeVisible({ timeout: 20_000 })
    await film.click()
    await expect(page.getByRole('heading', { name: 'Supplier questions' })).toBeVisible({ timeout: 20_000 })
    const gauge = page.getByRole('button', { name: '23 µm' })
    await expect(gauge).toBeVisible({ timeout: 20_000 })
    await gauge.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(outDir, 'supplier-questions-light.png') })

    await page.goto('/requests')
    await page.getByPlaceholder(/Search product/).fill('Mailer boxes')
    const mailer = page.getByRole('main').getByRole('link', { name: /Mailer boxes for e-commerce kit/ }).first()
    await expect(mailer).toBeVisible({ timeout: 15_000 })
    await mailer.click()
    await expect(page.getByText('No open questions from suppliers.')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(outDir, 'supplier-questions-empty-light.png') })

    await page.goto('/requests')
    await page.getByPlaceholder(/Search product/).fill('Printed labels')
    const labels = page.getByRole('main').getByRole('link', { name: /Printed labels/ }).first()
    await expect(labels).toBeVisible({ timeout: 15_000 })
    await labels.click()
    await expect(page.getByRole('heading', { name: 'Supplier questions' })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Is the core 3 inches?')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(outDir, 'supplier-questions-one-light.png') })
  })
})
