import { expect, test } from '@playwright/test'

import { NUXT_WELCOME_CHROMIUM_BASE64 } from './baselines'
import { ensureSnapshotBaseline } from './utils/snapshot'

test.describe('Nuxt welcome visual regression', () => {
  test('default welcome view remains visually stable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Visual snapshot comparison only runs on Chromium')

    await page.goto('/')
    await page.waitForTimeout(500)

    await ensureSnapshotBaseline(testInfo, 'nuxt-welcome.png', NUXT_WELCOME_CHROMIUM_BASE64)

    await expect(page).toHaveScreenshot('nuxt-welcome.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })
  })
})
