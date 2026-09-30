import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'
import { waitForPageData } from './helpers'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('DS-04 Request detail', () => {
  test('a commercial request shows asks and the request rail', async ({ page }) => {
    test.setTimeout(90_000)
    skipNoCreds()
    await gotoAuthenticated(page, '/requests')
    await waitForPageData(page)
    const rowLinks = page.locator('table.ds-table tbody a.qt-request-name, table.ds-table tbody a.ds-request-name')
    const rowCount = await rowLinks.count()
    if (rowCount === 0) test.skip(true, 'No requests in this account')
    let openedCommercial = false
    for (let index = 0; index < Math.min(rowCount, 8); index += 1) {
      await rowLinks.nth(index).click()
      await expect(page).toHaveURL(/\/rfqs\/[a-f0-9-]+/)
      await waitForPageData(page)
      if (await page.getByRole('tab', { name: /Suppliers/ }).count()) {
        openedCommercial = true
        break
      }
      await page.goto('/requests')
      await waitForPageData(page)
    }
    if (!openedCommercial) test.skip(true, 'No commercial request in the first rows')
    await expect(page.getByRole('tab', { name: /^Overview/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Suppliers/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Replies/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Quotes/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Comparison/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Request details' })).toBeVisible()
    await page.getByRole('button', { name: 'Add suppliers' }).click()
    const addSupplier = page.getByRole('dialog', { name: 'Add supplier' })
    await expect(addSupplier).toBeVisible()
    await expect(addSupplier.getByRole('tab', { name: 'From your directory' })).toBeVisible()
    await expect(addSupplier.getByRole('tab', { name: 'For this request only' })).toBeVisible()
  })
})
