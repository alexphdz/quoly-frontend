import fs from 'node:fs'
import { test, expect } from '@playwright/test'

const pdf = fs.readFileSync(new URL('./fixtures/e2e-reference-spec.pdf', import.meta.url))
for (const width of [1280, 390]) {
  test(`single specification drawer, signed PDF and legacy redirect at ${width}px`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      localStorage.setItem('quoly_token', 'spec-test-token')
      localStorage.setItem('quoly_locale', 'es')
    })
    const row = {
      quote_id: 'spec-quote', supplier_id: 'supplier', supplier_name: 'Acme', normalized_price: 12,
      raw_price: 12, raw_currency: 'USD', raw_unit: 'kg', raw_quantity_moq: 10,
      raw_delivery_lead_time_days: 10, raw_delivery_point: null, raw_payment_terms: null, missing_fields: [],
      spec_state: 'analyzed', buyer_has_reference: true, spec_source_url: 'https://broken.invalid/public/uuid.pdf',
      spec_document_name: 'uuid.pdf', file_type: 'pdf',
      spec_evidence_lines: [{ parameter_name: 'Capacity', supplier_wording: '650 mL', reference_wording: '500 mL', verdict: 'deviation', source_url: 'https://broken.invalid/public/uuid.pdf' }],
    }
    const modes: boolean[] = []
    await context.route('**/spec-original.pdf*', route => route.fulfill({ body: pdf, contentType: 'application/pdf', headers: new URL(route.request().url()).searchParams.has('download') ? { 'Content-Disposition': 'attachment; filename="Acme-datasheet.pdf"' } : {} }))
    await page.route('**/api/v1/**', async route => {
      const url = new URL(route.request().url())
      let json: unknown = []
      if (url.pathname.endsWith('/original')) {
        expect(route.request().headers().authorization).toBe('Bearer spec-test-token')
        const download = url.searchParams.get('download') === 'true'
        modes.push(download)
        json = { url: `http://localhost:5173/spec-original.pdf?token=signed${download ? '&download=1' : ''}`, filename: 'Acme-datasheet.pdf', expires_in: 300 }
      } else if (url.pathname.endsWith('/comparison')) json = {
        rfq_id: 'spec-rfq', rfq_name: 'Steel', base_currency: 'USD', base_unit: 'kg', rows: [row],
        ranking: ['spec-quote'], line_item_rows: [], line_item_ranking: {}, alerts: [], summary: 'Acme offers steel.', requested_quantity: 100,
      }
      else if (url.pathname.endsWith('/quotes/spec-quote')) json = { id: 'spec-quote', rfq_id: 'spec-rfq', supplier_name: 'Acme', status: 'confirmed', faithful_summary: 'Double-wall stainless steel, vacuum insulated.', missing_fields: [] }
      else if (url.pathname.endsWith('/rfqs/spec-rfq')) json = { id: 'spec-rfq', name: 'Steel', request_kind: 'commercial', quantity: 100, base_unit: 'kg', base_currency: 'USD', status: 'open', suppliers: [], quotes: [], attachments: [] }
      else if (url.pathname.endsWith('/decision')) { await route.fulfill({ status: 404, json: { detail: 'none' } }); return }
      else if (url.pathname.endsWith('/auth/me')) json = { id: 'buyer', email: 'buyer@example.com' }
      await route.fulfill({ json })
    })
    const brokenRequests: string[] = []
    page.on('request', request => { if (request.url().includes('broken.invalid')) brokenRequests.push(request.url()) })
    await page.goto('/rfqs/spec-rfq/comparison')
    const button = page.getByRole('button', { name: 'Ver ficha', exact: true })
    await expect(button).toHaveCount(1)
    await expect(page.getByText('Vista rápida', { exact: true })).toHaveCount(0)
    await button.click()
    const drawer = page.getByRole('dialog')
    await expect(drawer).toHaveCount(1)
    await expect(drawer.getByRole('heading', { name: 'Resumen de Quoly' })).toBeVisible()
    await expect(drawer.getByText('Double-wall stainless steel, vacuum insulated.')).toBeVisible()
    await expect(drawer.getByText('650 mL', { exact: true })).toBeVisible()
    await expect(drawer.getByText('500 mL', { exact: false })).toBeVisible()
    await expect(drawer.locator('.ds-pill')).toBeVisible()
    await expect(drawer.locator('a, iframe')).toHaveCount(0)
    const card = drawer.locator('.original-document')
    await expect(card.getByText('Acme-datasheet.pdf', { exact: true })).toBeVisible()
    const popupPromise = page.waitForEvent('popup')
    const requestPromise = context.waitForEvent('request', request => request.url().includes('/spec-original.pdf?'))
    await card.getByRole('button', { name: 'Abrir en otra pestaña' }).click()
    const popup = await popupPromise
    expect((await requestPromise).frame().page()).toBe(popup)
    await popup.close()
    const downloadPromise = page.waitForEvent('download')
    await card.getByRole('button', { name: 'Descargar', exact: true }).click()
    expect((await downloadPromise).suggestedFilename()).toBe('Acme-datasheet.pdf')
    expect(modes).toEqual([false, false, true])
    await page.screenshot({ path: `/tmp/quoly-spec-drawer-${width}.png` })
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(button).toBeFocused()
    await page.goto('/quotes/spec-quote/spec-evidence')
    await expect(page).toHaveURL(/\/rfqs\/spec-rfq\/comparison\?spec=spec-quote$/)
    await expect(drawer.getByText('Acme-datasheet.pdf', { exact: true })).toBeVisible()
    await drawer.getByRole('button', { name: 'Cerrar', exact: true }).click()
    await expect(drawer).toHaveCount(0)
    expect(brokenRequests).toEqual([])
  })
}
