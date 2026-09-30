import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from '../helpers/auth'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('DS-06 Theme', () => {
  test('requests table renders in light and dark', async ({ page }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/requests')
    await expect(page.getByRole('heading', { name: 'Requests' })).toBeVisible()

    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate(next => {
        localStorage.setItem('quoly_theme', next)
      }, theme)
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      await expect(page.getByRole('heading', { name: 'Requests' })).toBeVisible()
      const background = await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor)
      expect(background).not.toBe('rgba(0, 0, 0, 0)')
      expect(background).not.toBe('transparent')
    }

    await page.getByRole('link', { name: 'Settings' }).click()
    const appearance = page.getByRole('group', { name: 'Appearance' })
    await expect(appearance.getByRole('button', { name: 'Light', exact: true })).toBeVisible()
    await expect(appearance.getByRole('button', { name: 'Dark', exact: true })).toBeVisible()
    await expect(appearance.getByRole('button', { name: 'System', exact: true })).toBeVisible()
    await appearance.getByRole('button', { name: 'Light', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})
