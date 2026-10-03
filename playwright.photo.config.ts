import { defineConfig, devices } from '@playwright/test'

// Isolated UI integration checks: real cropper/canvas with mocked API/storage.
export default defineConfig({
  testDir: './e2e', testMatch: 'profile-photo.spec.ts', workers: 1,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5173', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
})
