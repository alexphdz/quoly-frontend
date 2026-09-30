import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'
import { waitForPageData } from './helpers'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('DS-02 Quotations', () => {
  test('review queue plus filterable table', async ({ page }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/quotations')
    await expect(page.getByRole('heading', { name: 'Quotes', level: 1 })).toBeVisible()
    await waitForPageData(page)
    if (await page.getByText('No quotes yet').isVisible()) return
    await expect(page.locator('select')).toHaveCount(0)
    await expect(page.getByText('Review queue')).toBeVisible()
    await expect(page.getByRole('heading', { name: /quotes need your review|quotes reviewed/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Review next quote' })).toBeVisible()
    await expect(page.getByPlaceholder('Supplier or request')).toBeVisible()
    for (const tab of ['All', 'To review', 'In comparison', 'Removed from comparison']) {
      await expect(page.getByRole('tab', { name: new RegExp(`^${tab}`) })).toBeVisible()
    }
    for (const header of ['Supplier', 'Request', 'Status', 'Normalized price', 'Original price', 'MOQ', 'Lead time']) {
      await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible()
    }
    await page.getByRole('button', { name: 'All requests' }).click()
    await page.getByPlaceholder('Find a request').fill('zzzz-no-such-request')
    await expect(page.getByText('No request matches')).toBeVisible()
    await page.keyboard.press('Escape')
  })
})
