import { expect, test } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test('should display the dashboard title and description', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page.getByRole('heading', { name: 'Security Robot RL Dashboard' })).toBeVisible()

    // Check description
    await expect(page.getByText('Use the navigation menu to manage training sessions')).toBeVisible()
  })

  test('should have navigation links to all main sections', async ({ page }) => {
    await page.goto('/')

    // Check all navigation links exist
    await expect(page.getByRole('link', { name: /training/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /playback/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /models/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('should navigate to training page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /training/i }).first().click()

    await expect(page).toHaveURL(/\/training/)
    await expect(page.getByRole('heading', { name: /training/i })).toBeVisible()
  })

  test('should navigate to playback page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /playback/i }).first().click()

    await expect(page).toHaveURL(/\/playback/)
    await expect(page.getByRole('heading', { name: /playback/i })).toBeVisible()
  })

  test('should navigate to models page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /models/i }).first().click()

    await expect(page).toHaveURL(/\/models/)
  })
})