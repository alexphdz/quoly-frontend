import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium, type FullConfig } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(__dirname, '.auth/buyer.json')

export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD
  if (!email || !password) {
    return
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:5173'
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`${baseURL}/login`)
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /Sign in|Iniciar sesión/ }).click()
  await page.waitForURL(`${baseURL}/`, { timeout: 30_000 })
  await page.context().storageState({ path: authFile })
  await browser.close()
}
