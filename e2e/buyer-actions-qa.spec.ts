import { test, expect } from '@playwright/test'
import { e2eCredentials, gotoAuthenticated } from './helpers/auth'
import { addSupplier, createCommercialRfq, seedBuyerActionViaScript } from './helpers/api'

const skipNoCreds = () => test.skip(!e2eCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')

test.describe('Buyer actions QA (module 4)', () => {
  test('BA-01: open ask visible, resolve updates panel and stage chips', async ({ page, request }) => {
    skipNoCreds()
    await gotoAuthenticated(page, '/')

    const stamp = Date.now()
    const question = `What quantity do you need for this order?`
    const rfq = await createCommercialRfq(request, page, `Buyer actions QA ${stamp}`)
    const supplier = await addSupplier(request, page, rfq.id, 'E2E ChemCo', `e2e-buyer-${stamp}@example.com`)
    seedBuyerActionViaScript(rfq.id, supplier.id, question)

    await page.goto(`/rfqs/${rfq.id}`)
    await expect(page.getByRole('heading', { name: rfq.name })).toBeVisible({ timeout: 15_000 })

    await expect(page.getByRole('heading', { name: 'Supplier questions' })).toBeVisible()
    await expect(page.getByText(question)).toBeVisible()
    await expect(page.getByText('500 kg')).toBeVisible()
    await expect(page.getByText('Waiting on you')).toBeVisible()

    await page.getByRole('button', { name: 'Mark resolved' }).click()
    await expect(page.getByText('Ask marked resolved')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Mark resolved' })).toHaveCount(0, { timeout: 10_000 })

    await expect(page.getByRole('heading', { name: 'Resolved' })).toBeVisible()
    await expect(page.getByText('No open questions from suppliers.')).toBeVisible()
    await expect(page.getByText(question)).toBeVisible()

    await expect(page.getByText('Waiting on you', { exact: true })).toHaveCount(0)
  })
})
