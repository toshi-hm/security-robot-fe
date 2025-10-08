import { expect, test } from '@playwright/test'

test.describe('Models Workflow', () => {
  test('should display models page', async ({ page }) => {
    await page.goto('/models')

    // Check page title (in Japanese)
    await expect(page.locator('.models__title')).toHaveText('モデル管理')
  })

  test('should display description text', async ({ page }) => {
    await page.goto('/models')

    // Check description is visible
    const description = page.locator('.models__description')
    await expect(description).toBeVisible()
    await expect(description).toContainText('訓練済みモデル')
  })

  test('should navigate to model detail page', async ({ page }) => {
    const modelId = 'model-abc123'
    await page.goto(`/models/${modelId}`)

    // Check model ID is displayed in title
    await expect(page.locator('.model-detail__title')).toContainText(modelId)
    await expect(page.locator('.model-detail__title')).toContainText('モデル詳細')
  })

  test('should display model detail description', async ({ page }) => {
    const modelId = 'model-xyz789'
    await page.goto(`/models/${modelId}`)

    // Check description exists
    const description = page.locator('.model-detail__description')
    await expect(description).toBeVisible()
    await expect(description).toContainText('個別モデルの評価メトリクス')
  })

  test('should have proper BEM structure on models index', async ({ page }) => {
    await page.goto('/models')

    // Check BEM structure
    await expect(page.locator('.models')).toBeVisible()
    await expect(page.locator('.models__title')).toBeVisible()
    await expect(page.locator('.models__description')).toBeVisible()
  })

  test('should have proper BEM structure on model detail', async ({ page }) => {
    await page.goto('/models/test-model')

    // Check BEM structure
    await expect(page.locator('.model-detail')).toBeVisible()
    await expect(page.locator('.model-detail__title')).toBeVisible()
    await expect(page.locator('.model-detail__description')).toBeVisible()
  })
})
