import fs from 'node:fs'
import { test, expect } from '@playwright/test'

const pdf = fs.readFileSync(new URL('./fixtures/e2e-reference-spec.pdf', import.meta.url))

for (const width of [1280, 390]) {
  test(`original PDF is visible and opens/downloads securely at ${width}px`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await page.addInitScript(() => {
      localStorage.setItem('quoly_token', 'document-test-token')
      localStorage.setItem('quoly_locale', 'es')
    })
    let fail = true
    const modes: boolean[] = []
    await context.route('**/test-original.pdf*', route => route.fulfill({
      body: pdf, contentType: 'application/pdf', headers: new URL(route.request().url()).searchParams.has('download')
        ? { 'Content-Disposition': 'attachment; filename="Supplier-offer.pdf"' } : {},
    }))
    await page.route('**/api/v1/**', async route => {
      const url = new URL(route.request().url())
      if (url.pathname.endsWith('/quotes/document-quote/original')) {
        expect(route.request().headers().authorization).toBe('Bearer document-test-token')
        const download = url.searchParams.get('download') === 'true'
        modes.push(download)
        if (fail) { await route.fulfill({ status: 502, json: { detail: 'document_access_failed' } }); return }
        await route.fulfill({ json: { url: `http://localhost:5173/test-original.pdf?token=temp${download ? '&download=1' : ''}`, filename: 'Supplier-offer.pdf', expires_in: 300 } })
      } else if (url.pathname.endsWith('/quotes/document-quote')) {
        await route.fulfill({ json: {
          id: 'document-quote', rfq_id: 'document-rfq', supplier_id: 'supplier', supplier_name: 'Proveedor Acme',
          status: 'draft', file_url: 'https://private.invalid/original.pdf', file_type: 'pdf',
          raw_text: 'Supplier quoted 12 USD per kg.', raw_price: 12, raw_currency: 'USD', raw_unit: 'kg',
          raw_delivery_lead_time_days: 10, missing_fields: [], created_at: '2026-10-02T12:00:00Z', updated_at: '2026-10-02T12:00:00Z',
        } })
      } else if (url.pathname.endsWith('/rfqs/document-rfq')) {
        await route.fulfill({ json: { id: 'document-rfq', request_kind: 'commercial', name: 'Acero', quantity: 100, base_unit: 'kg', base_currency: 'USD', status: 'open', suppliers: [], quotes: [], attachments: [] } })
      } else if (url.pathname.endsWith('/auth/me')) {
        await route.fulfill({ json: { id: 'buyer', email: 'buyer@example.com', avatar_url: null } })
      } else await route.fulfill({ json: [] })
    })
    await page.goto('/quotes/document-quote')
    const card = page.locator('.original-document')
    await expect(card.getByText('PDF original', { exact: true })).toBeVisible()
    await expect(card).toBeInViewport()
    await expect(card.locator('svg.original-document-pdf')).toBeVisible()
    await expect(page.locator('iframe')).toHaveCount(0)
    await card.getByRole('button', { name: 'Descargar', exact: true }).click()
    await expect(card.getByRole('alert')).toContainText('No se pudo abrir')
    fail = false
    const popupPromise = page.waitForEvent('popup')
    const fileRequest = context.waitForEvent('request', request => request.url().includes('/test-original.pdf?token=temp'))
    await card.getByRole('button', { name: 'Abrir en otra pestaña' }).click()
    const popup = await popupPromise
    const opened = await fileRequest
    expect(opened.isNavigationRequest()).toBe(true)
    expect(opened.frame().page()).toBe(popup)
    expect(opened.url()).not.toContain('download=')
    await popup.close()
    await expect(card.getByRole('button', { name: 'Descargar', exact: true })).toBeEnabled()
    await page.screenshot({ path: `/tmp/quoly-original-pdf-${width}.png` })
    const downloadPromise = page.waitForEvent('download')
    await card.getByRole('button', { name: 'Descargar', exact: true }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('Supplier-offer.pdf')
    expect(modes).toEqual([true, false, true])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
