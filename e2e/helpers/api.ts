import { execFileSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import type { APIRequestContext, Page } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? 'http://127.0.0.1:8000/api/v1'

export async function authHeaders(page: Page): Promise<Record<string, string>> {
  const token = await page.evaluate(() => localStorage.getItem('quoly_token'))
  if (!token) throw new Error('Missing quoly_token — log in before calling the API')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function createCommercialRfq(request: APIRequestContext, page: Page, name: string) {
  const headers = await authHeaders(page)
  const resp = await request.post(`${API_BASE}/rfqs`, {
    headers,
    data: {
      request_kind: 'commercial',
      name,
      quantity: 500,
      base_unit: 'kg',
      status: 'open',
    },
  })
  if (!resp.ok()) {
    throw new Error(`create RFQ failed: ${resp.status()} ${await resp.text()}`)
  }
  return resp.json() as Promise<{ id: string; email_address: string }>
}

export async function addSupplier(
  request: APIRequestContext,
  page: Page,
  rfqId: string,
  name: string,
  email: string,
) {
  const headers = await authHeaders(page)
  const resp = await request.post(`${API_BASE}/rfqs/${rfqId}/suppliers`, {
    headers,
    data: { name, email },
  })
  if (!resp.ok()) {
    throw new Error(`add supplier failed: ${resp.status()} ${await resp.text()}`)
  }
  return resp.json() as Promise<{ id: string }>
}

export async function sendRfqRequests(request: APIRequestContext, page: Page, rfqId: string) {
  const headers = await authHeaders(page)
  const resp = await request.post(`${API_BASE}/rfqs/${rfqId}/send`, { headers })
  if (!resp.ok()) {
    throw new Error(`send RFQ failed: ${resp.status()} ${await resp.text()}`)
  }
  return resp.json()
}

export function seedBuyerActionViaScript(rfqId: string, supplierId: string, question: string) {
  const backendRoot = path.join(__dirname, '../../../Backend')
  const python = path.join(backendRoot, '.venv/bin/python')
  const script = path.join(backendRoot, 'scripts/seed_e2e_buyer_action.py')
  execFileSync(python, [script, '--rfq-id', rfqId, '--supplier-id', supplierId, '--question', question], {
    cwd: backendRoot,
    stdio: 'pipe',
  })
}
