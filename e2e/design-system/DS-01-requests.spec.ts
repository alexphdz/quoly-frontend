import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'
import { waitForPageData } from './helpers'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('DS-01 Requests', () => {
  test('list is a table with facts and tabs, not a donut', async ({ page }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/requests')
    await expect(page.getByRole('heading', { name: 'Requests' })).toBeVisible()
    await expect(page.getByRole('main').getByRole('link', { name: 'New request' })).toBeVisible()
    await waitForPageData(page)
    await expect(page.locator('svg.donut-chart')).toHaveCount(0)
    const empty = page.getByText('No requests yet')
    if (await empty.isVisible()) return
    await expect(page.getByRole('heading', { name: /Needs attention|Requieren atención/ })).toBeVisible()
    await expect(page.getByPlaceholder(/Product, reference or ID|Producto, referencia o ID/)).toBeVisible()
    for (const tab of ['All', 'Open', 'Drafts', 'Closed']) {
      await expect(page.getByRole('tab', { name: new RegExp(tab) })).toBeVisible()
    }
    for (const header of ['Request', 'Status', 'Quantity', 'Quotes in', 'Deadline', 'Updated']) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible()
    }
    await expect(page.locator('svg.donut-chart')).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: /Next step|Siguiente paso/ })).toHaveCount(0)
  })
})
