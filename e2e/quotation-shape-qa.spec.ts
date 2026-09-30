import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { addSupplier, authHeaders, createCommercialRfq } from './helpers/api'
import { execFileSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

function seedPartialQuote(
  rfqId: string,
  supplierId: string,
  status: 'draft' | 'confirmed' = 'confirmed',
): string {
  const backendRoot = path.join(__dirname, '../../Backend')
  const python = path.join(backendRoot, '.venv/bin/python')
  const script = path.join(backendRoot, 'scripts/seed_e2e_partial_quote.py')
  const out = execFileSync(
    python,
    [script, '--rfq-id', rfqId, '--supplier-id', supplierId, '--status', status],
    { cwd: backendRoot, encoding: 'utf8' },
  )
  const line = out.trim().split('\n').pop() ?? ''
  const match = line.match(/^quote_id=(.+)$/)
  if (!match) throw new Error(`seed partial quote: expected quote_id line, got: ${line}`)
  return match[1]
}

test.describe('Quotation shape QA (module 5)', () => {
  test('QS-01: partial quote in comparison shows tiers and split lead time', async ({ page, request }) => {
    test.setTimeout(90_000)
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/')

    const rfq = await createCommercialRfq(request, page, `Quotation QA ${stamp}`)
    const supplier = await addSupplier(request, page, rfq.id, 'Tier Co', `tier-${stamp}@example.com`)
    seedPartialQuote(rfq.id, supplier.id)

    await page.goto(`/rfqs/${rfq.id}/comparison`)
    await expect(page.getByRole('heading', { name: 'Comparison', exact: true })).toBeVisible({ timeout: 20_000 })
    const table = page.getByRole('table')
    await expect(table.getByText('Tier Co')).toBeVisible()
    await expect(table.getByText(/1,000 kg @/)).toBeVisible()
    await expect(table.getByText(/12 d prod/)).toBeVisible()
    await expect(table.getByText(/18 d transit/)).toBeVisible()
    await expect(table.getByText(/Minimum order 500 kg/)).toBeVisible()

    const headers = await authHeaders(page)
    const cmp = await request.get(`http://127.0.0.1:8000/api/v1/rfqs/${rfq.id}/comparison`, { headers })
    expect(cmp.status()).toBe(200)
    const body = await cmp.json()
    expect(body.rows[0].commercial_offer?.price_tiers?.length).toBeGreaterThan(0)
  })

  test('QS-02: include partial quote from quote detail adds it to comparison', async ({ page, request }) => {
    test.setTimeout(150_000)
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/')

    const rfq = await createCommercialRfq(request, page, `Quotation UI ${stamp}`)
    const supplier = await addSupplier(request, page, rfq.id, 'Tier Co', `tier-ui-${stamp}@example.com`)
    const quoteId = seedPartialQuote(rfq.id, supplier.id, 'draft')

    await page.goto(`/quotes/${quoteId}`)
    await expect(page.getByRole('heading', { name: 'Quote review', exact: true })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByText(/Partial quote — no price yet/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/1,000 kg/)).toBeVisible()
    const confirmResp = page.waitForResponse(
      (r) => r.url().includes(`/quotes/${quoteId}/confirm`) && r.status() === 200,
    )
    await page.getByRole('button', { name: 'Add to comparison' }).click()
    await confirmResp

    const headers = await authHeaders(page)
    await expect
      .poll(async () => {
        const q = await request.get(`http://127.0.0.1:8000/api/v1/quotes/${quoteId}`, { headers })
        if (!q.ok()) return `http ${q.status()}`
        return (await q.json()).status as string
      }, { timeout: 20_000 })
      .toBe('confirmed')

    await expect(page.getByText('This quote is in the comparison.')).toBeVisible({
      timeout: 15_000,
    })

    await page.goto(`/rfqs/${rfq.id}/comparison`)
    await expect(page.getByRole('heading', { name: 'Comparison', exact: true })).toBeVisible({
      timeout: 20_000,
    })
    const table = page.getByRole('table')
    await expect(table.getByText('Tier Co')).toBeVisible({ timeout: 15_000 })
    await expect(table.getByText(/1,000 kg @/)).toBeVisible()

    const cmp = await request.get(`http://127.0.0.1:8000/api/v1/rfqs/${rfq.id}/comparison`, { headers })
    expect(cmp.status()).toBe(200)
    const body = await cmp.json()
    expect(body.rows.some((r: { supplier_name?: string }) => r.supplier_name === 'Tier Co')).toBe(true)
  })
})
