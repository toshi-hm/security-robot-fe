import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADED ? false : true,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] }, dependencies: ['setup'] },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] }, dependencies: ['setup'] },
  ],
})
