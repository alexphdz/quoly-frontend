import { test, expect } from '@playwright/test'

for (const locale of ['en', 'es']) {
  test(`retrieved document context is attributed and separated from the current reply (${locale})`, async ({ page }) => {
    await page.addInitScript(({ selectedLocale }) => {
      localStorage.setItem('quoly_token', 'retrieval-context-test-token')
      localStorage.setItem('quoly_locale', selectedLocale)
    }, { selectedLocale: locale })

    await page.route('**/api/v1/**', async route => {
      const url = new URL(route.request().url())
      if (url.pathname.endsWith('/auth/me')) {
        await route.fulfill({ json: { id: 'buyer', email: 'buyer@example.com', avatar_url: null } })
      } else if (url.pathname.endsWith('/quotes/retrieval-quote')) {
        await route.fulfill({ json: {
          id: 'retrieval-quote', rfq_id: 'retrieval-rfq', supplier_id: 'supplier',
          supplier_name: 'Supplier Example', status: 'draft', raw_text: 'We changed the unit price; all other terms unchanged.',
          raw_price: 0.84, raw_currency: 'USD', raw_unit: 'piece', missing_fields: [],
          created_at: '2026-10-05T12:00:00Z', updated_at: '2026-10-05T12:00:00Z',
          extraction_pass: {
            summary: 'The supplier changed the unit price.',
            message_labels: ['partial_quotation'],
            processing: { status: 'complete' },
            retrieval_metadata: { status: 'retrieved' },
            facts: [{ field_name: 'payment_terms', raw_value: 'Net 30', origin: 'inherited',
              review_state: 'inherited', evidence: [
                { segment_id: 'current-reply', exact_text: 'all other terms unchanged' },
                { segment_id: 'prior-offer', exact_text: 'Payment terms: Net 30' },
              ] }],
            source_map: [
              { segment_id: 'current-reply', source_kind: 'supplier_message',
                segment_type: 'latest_reply', locator: { section: 'latest_reply' }, read_status: 'read' },
              { segment_id: 'buyer-ref-segment', source_kind: 'buyer_reference',
                original_filename: 'buyer-spec.pdf', segment_type: 'retrieved_context',
                locator: { page: 4 }, read_status: 'read' },
              { segment_id: 'prior-offer', source_kind: 'supplier_attachment',
                original_filename: 'prior-quote.pdf', segment_type: 'retrieved_context',
                locator: { page: 2 }, read_status: 'read' },
            ],
            retrieved_context: [
              { id: 'buyer-ref-segment', source_kind: 'buyer_reference',
                locator: { page: 4 }, text: 'Freight is excluded from the target offer.' },
              { id: 'prior-offer', source_kind: 'supplier_attachment',
                locator: { page: 2 }, text: 'Payment terms: Net 30' },
            ],
          },
        } })
      } else if (url.pathname.endsWith('/rfqs/retrieval-rfq')) {
        await route.fulfill({ json: { id: 'retrieval-rfq', request_kind: 'commercial',
          name: 'Resin', quantity: 1000, base_unit: 'kg', base_currency: 'USD',
          status: 'open', suppliers: [], quotes: [], attachments: [] } })
      } else {
        await route.fulfill({ json: [] })
      }
    })

    await page.goto('/quotes/retrieval-quote')
    const panel = page.getByRole('region', { name: locale === 'en' ? 'AI reading' : 'Lectura de IA' })
    await expect(panel.getByText(locale === 'en'
      ? 'Related source context considered' : 'Contexto de fuentes relacionadas')).toBeVisible()
    await expect(panel.getByText(locale === 'en'
      ? 'These source passages provide context. They are not statements from the current supplier reply.'
      : 'Estos fragmentos aportan contexto. No son afirmaciones de la respuesta actual del proveedor.')).toBeVisible()
    await expect(panel.getByText('Freight is excluded from the target offer.')).toBeVisible()
    await expect(panel.getByText(/buyer-spec\.pdf/)).toBeVisible()
    await expect(panel.getByText(/page 4|página 4/)).toBeVisible()
    await expect(panel.getByText(locale === 'en' ? 'Inherited' : 'Heredado')).toBeVisible()
    await expect(panel.getByText('all other terms unchanged')).toBeVisible()
    await expect(panel.getByText('Payment terms: Net 30').first()).toBeVisible()
    await expect(panel.getByText(/prior-quote\.pdf/).first()).toBeVisible()
  })

  test(`zero retrieval hits are not presented as proof of absence (${locale})`, async ({ page }) => {
    await page.addInitScript(({ selectedLocale }) => {
      localStorage.setItem('quoly_token', 'retrieval-context-test-token')
      localStorage.setItem('quoly_locale', selectedLocale)
    }, { selectedLocale: locale })
    await page.route('**/api/v1/**', async route => {
      const url = new URL(route.request().url())
      if (url.pathname.endsWith('/auth/me')) {
        await route.fulfill({ json: { id: 'buyer', email: 'buyer@example.com', avatar_url: null } })
      } else if (url.pathname.endsWith('/quotes/retrieval-empty')) {
        await route.fulfill({ json: {
          id: 'retrieval-empty', rfq_id: 'retrieval-rfq', supplier_id: 'supplier',
          supplier_name: 'Supplier Example', status: 'draft', raw_price: null,
          missing_fields: [], created_at: '2026-10-05T12:00:00Z', updated_at: '2026-10-05T12:00:00Z',
          extraction_pass: { summary: 'No terms were recognized.', processing: { status: 'partial' },
            retrieval_metadata: { status: 'not_evaluated', matched_segments: 0, query_terms: ['freight'] },
            source_map: [], retrieved_context: [] },
        } })
      } else if (url.pathname.endsWith('/rfqs/retrieval-rfq')) {
        await route.fulfill({ json: { id: 'retrieval-rfq', request_kind: 'commercial',
          name: 'Resin', quantity: 1000, base_unit: 'kg', base_currency: 'USD',
          status: 'open', suppliers: [], quotes: [], attachments: [] } })
      } else await route.fulfill({ json: [] })
    })
    await page.goto('/quotes/retrieval-empty')
    const panel = page.getByRole('region', { name: locale === 'en' ? 'AI reading' : 'Lectura de IA' })
    await expect(panel.getByText(locale === 'en'
      ? 'No related passages were retrieved. This does not establish that the information is absent.'
      : 'No se recuperaron fragmentos relacionados. Esto no confirma que la información esté ausente.')).toBeVisible()
  })
}
