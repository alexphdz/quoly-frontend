import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { addSupplier, authHeaders, createCommercialRfq, sendRfqRequests } from './helpers/api'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('Supplier stages QA (module 2)', () => {
  test('SS-01: send moves supplier to awaiting response chip', async ({ page, request }) => {
    skipNoCreds()
    const stamp = Date.now()
    await gotoAuthenticated(page, '/')

    const rfq = await createCommercialRfq(request, page, `Stage QA ${stamp}`)
    await addSupplier(request, page, rfq.id, 'Stage Co', `stage-${stamp}@example.com`)

    await sendRfqRequests(request, page, rfq.id)

    await page.goto(`/rfqs/${rfq.id}`)
    await expect(page.getByRole('heading', { name: rfq.name })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Awaiting response')).toBeVisible({ timeout: 15_000 })

    const headers = await authHeaders(page)
    const second = await request.post(`http://127.0.0.1:8000/api/v1/rfqs/${rfq.id}/send`, { headers })
    expect(second.status()).toBe(400)
  })
})
