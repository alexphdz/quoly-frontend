import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'
import { waitForPageData } from './helpers'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('DS-03 Suppliers', () => {
  test('directory is an Active and Archived table', async ({ page }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/suppliers')
    await expect(page.getByRole('heading', { name: 'Suppliers' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add supplier' })).toBeVisible()
    await waitForPageData(page)
    await expect(page.getByRole('tab', { name: /Active/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Archived/ })).toBeVisible()
    const empty = page.getByText('No suppliers in the directory yet')
    if (await empty.isVisible()) return
    for (const header of ['Company', 'Primary contact', 'Tags']) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible()
    }
  })
})
