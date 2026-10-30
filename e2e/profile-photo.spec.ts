import { test, expect } from '@playwright/test'

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`profile photo crop, save, remove and fallback at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.addInitScript(() => {
      localStorage.setItem('quoly_token', 'photo-test-token')
      localStorage.setItem('i18nextLng', 'en')
    })
    let avatar: string | null = null
    let failUpload = true
    let uploaded = false
    let imageData = ''
    const profile = () => ({ id: 'photo-user', email: 'alex.buyer@example.com', avatar_url: avatar,
      google_connected: false, outlook_connected: false, default_email_locale: 'en',
      created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' })
    await page.route('**/api/v1/**', async route => {
      const path = new URL(route.request().url()).pathname
      if (path.endsWith('/auth/me/avatar')) {
        if (route.request().method() === 'POST') {
          if (failUpload) {
            await route.fulfill({ status: 502, json: { detail: 'storage_unavailable' } })
            return
          }
          const body = route.request().postDataBuffer()!
          expect(body.toString('latin1')).toContain('image/webp')
          const start = body.indexOf('\r\n\r\n') + 4
          const end = body.lastIndexOf('\r\n--')
          const encoded = body.subarray(start, end).toString('base64')
          const dimensions = await page.evaluate(async data => {
            const image = new Image()
            image.src = `data:image/webp;base64,${data}`
            await image.decode()
            return [image.naturalWidth, image.naturalHeight]
          }, encoded)
          expect(dimensions).toEqual([512, 512])
          uploaded = true
          avatar = `data:image/webp;base64,${encoded}`
        } else avatar = null
        await route.fulfill({ json: profile() })
      } else if (path.endsWith('/auth/me')) await route.fulfill({ json: profile() })
      else await route.fulfill({ json: [] })
    })
    await page.goto('/settings')
    const section = page.locator('#profile-photo')
    await expect(section.getByRole('button', { name: 'Change photo' })).toBeEnabled()
    imageData = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 800; canvas.height = 600
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#2198ac'; ctx.fillRect(0, 0, 400, 600)
      ctx.fillStyle = '#db9637'; ctx.fillRect(400, 0, 400, 600)
      return canvas.toDataURL('image/png').split(',')[1]
    })
    await section.getByRole('button', { name: 'Change photo' }).click()
    const dialog = page.getByRole('dialog', { name: 'Crop profile photo' })
    await dialog.locator('input[type=file]').setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') })
    await expect(dialog.getByRole('alert')).toContainText('Choose a PNG')
    await dialog.locator('input[type=file]').setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('invalid image') })
    await expect(dialog.getByRole('alert')).toContainText('could not be opened')
    await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
    await dialog.locator('input[type=file]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from(imageData, 'base64') })
    await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
    // Original photos in all supported formats decode in the actual cropper.
    for (const mimeType of ['image/jpeg', 'image/webp']) {
      const encoded = await page.evaluate(async ({ data, type }) => {
        const image = new Image()
        image.src = `data:image/png;base64,${data}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width; canvas.height = image.height
        canvas.getContext('2d')!.drawImage(image, 0, 0)
        return canvas.toDataURL(type).split(',')[1]
      }, { data: imageData, type: mimeType })
      await dialog.locator('input[type=file]').setInputFiles({ name: 'photo', mimeType, buffer: Buffer.from(encoded, 'base64') })
      await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
    }
    await dialog.getByRole('slider', { name: 'Zoom' }).fill('1.5')
    await expect(dialog).toBeInViewport()
    await page.screenshot({ path: `/tmp/quoly-photo-crop-${viewport.width}.png` })
    const crop = dialog.getByLabel('Photo position')
    await crop.focus()
    await page.keyboard.press('ArrowRight')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(dialog.getByRole('alert')).toContainText('could not be saved')
    failUpload = false
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(dialog).toBeHidden()
    expect(uploaded).toBe(true)
    await expect(section.locator('img')).toBeVisible()
    await page.screenshot({ path: `/tmp/quoly-photo-settings-${viewport.width}.png` })
    await expect(page.locator('.sidebar-avatar img')).toHaveAttribute('src', avatar!)
    await page.reload()
    await expect(section.locator('img')).toBeVisible()
    await section.getByRole('button', { name: 'Change photo' }).click()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(section.locator('img')).toBeVisible()
    await section.getByRole('button', { name: 'Remove photo' }).click()
    await page.getByRole('dialog', { name: 'Remove profile photo?' }).getByRole('button', { name: 'Remove photo', exact: true }).click()
    await expect(section.locator('img')).toHaveCount(0)
    await expect(page.locator('.sidebar-avatar')).toContainText('AB')
    avatar = 'https://broken.invalid/avatar.webp'
    await page.route('https://broken.invalid/**', route => route.abort())
    await page.reload()
    await expect(section.locator('.avatar')).toContainText('AB')
    await expect(page.locator('.sidebar-avatar')).toContainText('AB')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}
