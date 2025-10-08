import { expect, test } from '@playwright/test'

test.describe('Playback Workflow', () => {
  test('should display playback page', async ({ page }) => {
    await page.goto('/playback')

    // Check page title
    await expect(page.getByRole('heading', { name: /playback sessions/i })).toBeVisible()
  })

  test('should render playback control component', async ({ page }) => {
    await page.goto('/playback')

    // Check playback control component is present
    const playbackControl = page.locator('.playback-control')
    await expect(playbackControl).toBeVisible()
  })

  test('should navigate to playback session page', async ({ page }) => {
    const sessionId = 'playback-session-789'
    await page.goto(`/playback/${sessionId}`)

    // Check session ID is displayed in title
    await expect(page.getByRole('heading', { name: new RegExp(sessionId) })).toBeVisible()
  })

  test('should display playback timeline on session page', async ({ page }) => {
    const sessionId = 'playback-session-999'
    await page.goto(`/playback/${sessionId}`)

    // Timeline should be rendered (timeline is a slider input)
    const timeline = page.locator('.el-slider, [role="slider"]')
    await expect(timeline).toBeVisible()
  })

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/playback')

    // Check main container
    await expect(page.locator('main, [role="main"]')).toBeVisible()
    
    // Check heading exists
    const heading = page.getByRole('heading', { level: 2 })
    await expect(heading).toBeVisible()
  })
})
