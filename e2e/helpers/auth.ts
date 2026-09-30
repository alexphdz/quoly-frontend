import { expect, type Page } from '@playwright/test'

export function e2eCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

export function demoCredentials(): { email: string; password: string } | null {
  const email = process.env.DEMO_EMAIL
  const password = process.env.DEMO_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

async function loginWith(
  page: Page,
  creds: { email: string; password: string },
  missingMessage: string,
) {
  await page.goto('/login')
  await page.getByPlaceholder('alex@company.com').fill(creds.email)
  await page.getByPlaceholder('••••••••••••').fill(creds.password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  const loginError = page.getByText(
    /Incorrect email or password|invalid credentials|confirm your email|not confirmed/i,
  )
  const dashboard = page.waitForURL('/', { timeout: 15_000 })
  const failed = loginError.waitFor({ state: 'visible', timeout: 15_000 })

  await Promise.race([dashboard, failed.catch(() => undefined)])
  if (await loginError.isVisible()) {
    throw new Error(missingMessage)
  }
  await expect(page).toHaveURL('/')
}

export async function loginAsBuyer(page: Page) {
  const creds = e2eCredentials()
  if (!creds) {
    throw new Error('Set E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local')
  }
  await loginWith(
    page,
    creds,
    'E2E login failed: check E2E_EMAIL and E2E_PASSWORD in Frontend/.env.e2e.local (API returned invalid credentials).',
  )
}

export async function loginAsDemo(page: Page) {
  const creds = demoCredentials()
  if (!creds) {
    throw new Error('Set DEMO_EMAIL and DEMO_PASSWORD in Frontend/.env.demo.local')
  }
  await loginWith(
    page,
    creds,
    'Demo login failed: confirm DEMO_EMAIL in Supabase Auth, then retry.',
  )
}

/** Open a protected route; re-login once if the session was cleared (e.g. after AUTH-01). */
export async function gotoAuthenticated(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  if (page.url().includes('/login')) {
    await loginAsBuyer(page)
    await page.goto(path, { waitUntil: 'domcontentloaded' })
  }
}

/** Same as gotoAuthenticated, but never uses the E2E buyer session. */
export async function gotoAuthenticatedDemo(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  if (page.url().includes('/login')) {
    await loginAsDemo(page)
    await page.goto(path, { waitUntil: 'domcontentloaded' })
  }
}
