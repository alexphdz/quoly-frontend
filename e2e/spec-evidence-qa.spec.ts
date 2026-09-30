import { test, expect } from '@playwright/test'
import { execFileSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { addSupplier, authHeaders, createCommercialRfq } from './helpers/api'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

function seedSpecEvidenceQuote(rfqId: string, supplierId: string): string {
  const backendRoot = path.join(__dirname, '../../Backend')
  const python = path.join(backendRoot, '.venv/bin/python')
  const script = path.join(backendRoot, 'scripts/seed_e2e_spec_evidence.py')
  const out = execFileSync(python, [script, '--rfq-id', rfqId, '--supplier-id', supplierId], {
    cwd: backendRoot,
    encoding: 'utf8',
  })
  const line = out.trim().split('\n').pop() ?? ''
  const match = line.match(/^quote_id=(.+)$/)
  if (!match) throw new Error(`seed spec evidence: expected quote_id line, got: ${line}`)
  return match[1]
}

test.describe('Spec evidence QA (module 7)', () => {
  test('SE-01: verdicts on spec evidence page and comparison', async ({ page, request }) => {
    test.setTimeout(90_000)
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/')

    const rfq = await createCommercialRfq(request, page, `Spec QA ${stamp}`)
    const supplier = await addSupplier(request, page, rfq.id, 'Spec Co', `spec-${stamp}@example.com`)
    const quoteId = seedSpecEvidenceQuote(rfq.id, supplier.id)

    await page.goto(`/quotes/${quoteId}/spec-evidence`)
    await expect(page.getByRole('heading', { name: 'Specification evidence', exact: true })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByText('Compared to your reference')).toBeVisible()
    await expect(page.getByRole('table').getByText('Deviation', { exact: true })).toBeVisible()
    await expect(page.getByText('99.5%')).toBeVisible()
    await expect(page.getByText('99.2%')).toBeVisible()

    await page.goto(`/rfqs/${rfq.id}/comparison`)
    await expect(page.getByRole('heading', { name: 'Comparison', exact: true })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: 'Quick view' }).first().click()
    await expect(page.getByText('Specification quick view')).toBeVisible()
    await expect(page.getByRole('dialog').getByText('Deviation', { exact: true })).toBeVisible()

    const headers = await authHeaders(page)
    const api = await request.get(`http://127.0.0.1:8000/api/v1/quotes/${quoteId}/spec-evidence`, { headers })
    expect(api.status()).toBe(200)
    const body = await api.json()
    expect(body.lines.some((l: { verdict?: string }) => l.verdict === 'deviation')).toBe(true)
  })
})
