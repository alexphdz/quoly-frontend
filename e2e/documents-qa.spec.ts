import { test, expect } from '@playwright/test'
import { pickOption } from './helpers/select'
import path from 'path'
import { fileURLToPath } from 'url'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { authHeaders, createCommercialRfq } from './helpers/api'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specPdf = path.join(__dirname, 'fixtures/e2e-reference-spec.pdf')
const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('Documents QA (module 6)', () => {
  test('DOC-01: reference PDF on create appears on request detail', async ({ page }) => {
    skipNoCreds()
    const stamp = Date.now()
    const product = `E2E Spec PDF ${stamp}`

    await gotoAuthenticated(page, '/rfqs/new')
    await page.getByPlaceholder('What you are sourcing').fill(product)
    await page.locator('input[name="quantity"]').fill('800')
    await pickOption(page, 'base_unit', 'kg')
    await page.locator('input[type="file"][accept*="pdf"]').setInputFiles(specPdf)
    await page.getByRole('button', { name: 'Create request' }).click()
    await expect(page).toHaveURL(/\/rfqs\/[a-f0-9-]+/, { timeout: 25_000 })
    await expect(page.getByRole('heading', { name: product })).toBeVisible()
    await expect(page.getByText('Reference PDF attached')).toBeVisible()
    await expect(page.getByRole('link', { name: 'e2e-reference-spec.pdf' })).toBeVisible()
  })

  test('DOC-02: add reference PDF from request detail', async ({ page, request }) => {
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/')
    const rfq = await createCommercialRfq(request, page, `E2E Detail Spec ${stamp}`)
    await page.goto(`/rfqs/${rfq.id}`)
    await expect(page.getByText('Ask supplier for datasheet')).toBeVisible()
    await page.getByTestId('reference-spec-file').setInputFiles(specPdf)
    await expect(page.getByRole('link', { name: 'e2e-reference-spec.pdf' })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Reference PDF attached')).toBeVisible()

    const headers = await authHeaders(page)
    const detail = await request.get(`http://127.0.0.1:8000/api/v1/rfqs/${rfq.id}`, { headers })
    expect(detail.status()).toBe(200)
    const body = await detail.json()
    expect(body.attachments?.some((a: { file_name?: string }) => a.file_name === 'e2e-reference-spec.pdf')).toBe(
      true,
    )
  })

  test('DOC-03: free-text requirements show text scenario', async ({ page, request }) => {
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/rfqs/new')
    await page.getByPlaceholder('What you are sourcing').fill(`E2E Text Spec ${stamp}`)
    await page.locator('input[name="quantity"]').fill('500')
    await pickOption(page, 'base_unit', 'kg')
    await page.locator('textarea[name="technical_requirements"]').fill('Assay 99% minimum.')
    await page.getByRole('button', { name: 'Create request' }).click()
    await expect(page).toHaveURL(/\/rfqs\/[a-f0-9-]+/, { timeout: 25_000 })
    await expect(page.getByText('Requirements in free text')).toBeVisible()
    await expect(page.getByText(/Assay 99%/)).toBeVisible()
  })
})
