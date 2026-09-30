import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'
import { waitForPageData } from './helpers'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('DS-05 Comparison', () => {
  test('recommendation is readable and every row has a spec sheet cell', async ({ page }) => {
    test.setTimeout(120_000)
    skipNoCreds()
    await gotoAuthenticated(page, '/requests')
    await waitForPageData(page)
    const compare = page.getByRole('link', { name: /^Compare / }).first()
    if (await compare.count() === 0) test.skip(true, 'No request with a comparison in this account')
    await compare.click()
    await page.waitForURL(/\/comparison/)
    await expect(
      page.getByRole('heading', { name: 'Comparison', exact: true })
        .or(page.getByText('No quotes in the comparison yet'))
        .or(page.getByText('Failed to load comparison.')),
    ).toBeVisible({ timeout: 45_000 })
    const ready = page.getByRole('heading', { name: 'Comparison', exact: true })
    if (!(await ready.isVisible())) return
    await expect(page.getByRole('region', { name: 'Recommendation' }).getByText('Recommended')).toBeVisible()
    await expect(page.getByRole('rowheader', { name: 'Spec sheet' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Currency' })).toBeVisible()

    const specRow = page.locator('tr').filter({ has: page.getByRole('rowheader', { name: 'Spec sheet' }) })
    const cells = specRow.getByRole('cell')
    const cellCount = await cells.count()
    expect(cellCount).toBeGreaterThan(0)
    for (let index = 0; index < cellCount; index += 1) {
      await expect(cells.nth(index)).toContainText(/View spec|No specification/)
    }

    const viewSpec = page.getByRole('button', { name: 'View spec' }).first()
    if (await viewSpec.count() > 0) {
      await viewSpec.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.locator('iframe')).toBeVisible()
      await dialog.getByRole('button', { name: 'Close' }).click()
      await expect(dialog).toHaveCount(0)
    }

    const missing = page.getByText('No specification', { exact: true }).first()
    if (await missing.count() > 0) {
      const tag = await missing.evaluate(node => node.tagName)
      expect(tag).not.toBe('BUTTON')
    }
  })
})
