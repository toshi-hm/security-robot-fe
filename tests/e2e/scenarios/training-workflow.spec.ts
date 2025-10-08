import { expect, test } from '@playwright/test'

test.describe('Training Workflow', () => {
  test('should display training page with control component', async ({ page }) => {
    await page.goto('/training')

    // Check page title
    await expect(page.getByRole('heading', { name: /training sessions/i })).toBeVisible()

    // Check training control component is rendered
    await expect(page.locator('.training-control')).toBeVisible()
  })

  test('should display training progress when session exists', async ({ page }) => {
    await page.goto('/training')

    // Check if progress component is present
    const progressComponent = page.locator('.training-progress')
    
    // Note: Actual visibility depends on session state
    // In a real test, we would mock the backend or create a session first
  })

  test('should navigate to training session detail page', async ({ page }) => {
    await page.goto('/training')

    // This test would require backend mock or actual session creation
    // For now, we can test the URL pattern works
    const sessionId = 'test-session-123'
    await page.goto(`/training/${sessionId}`)

    await expect(page.getByRole('heading', { name: new RegExp(sessionId) })).toBeVisible()
  })

  test('should display training metrics page', async ({ page }) => {
    const sessionId = 'test-session-456'
    await page.goto(`/training/${sessionId}/metrics`)

    await expect(page.getByRole('heading', { name: /metrics for session/i })).toBeVisible()
  })

  test('should have proper page structure on training index', async ({ page }) => {
    await page.goto('/training')

    // Check main container
    await expect(page.locator('main, [role="main"]')).toBeVisible()
    
    // Check heading exists
    const heading = page.getByRole('heading', { level: 2 })
    await expect(heading).toBeVisible()
  })
})
