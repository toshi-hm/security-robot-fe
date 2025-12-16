import { expect, test } from '@playwright/test'

test.describe('Training Workflow', () => {
  test('should submit training session with cycle 10 and GPU parameters', async ({ page }) => {
    // Mock the API response
    await page.route('/api/v1/training/sessions', async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()

      // Verify payload
      expect(postData).toMatchObject({
        name: 'E2E Test Session',
        environment_type: 'enhanced',
        config: {
          battery_drain_rate: 0.1,
          threat_penalty_weight: 50,
          strategic_init_mode: true,
          num_envs: 1,
        },
      })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 999,
          name: 'E2E Test Session',
          status: 'pending',
        }),
      })
    })

    await page.goto('/training')

    // Open form
    await page.getByRole('button', { name: '新規学習セッションを開始' }).click()

    // Fill name
    // Element Plus inputs often need specific targeting
    await page.getByPlaceholder('例: PPO学習 実行1').fill('E2E Test Session')

    // Select Environment Type: Enhanced
    // Element Plus select is complex, simpler to click label then option if possible,
    // or use specific locator strategy.
    // Clicking the input inside the form-item for '環境タイプ'
    await page.locator('.el-form-item').filter({ hasText: '環境タイプ' }).locator('div.el-select').click()
    await page.getByRole('option', { name: '拡張環境' }).click()

    // Wait for extended fields to appear
    await expect(page.getByText('拡張設定 (Cycle 10)')).toBeVisible()

    // Set Battery Drain Rate
    // Element Plus InputNumber has input inside
    const batteryInput = page.locator('.el-form-item').filter({ hasText: 'バッテリー消費率' }).locator('input')
    await batteryInput.clear()
    await batteryInput.fill('0.1')

    // Set Threat Penalty
    const threatInput = page.locator('.el-form-item').filter({ hasText: '脅威ペナルティ' }).locator('input')
    await threatInput.clear()
    await threatInput.fill('50')

    // Toggle Strategic Init
    // Element Plus switch
    await page.locator('.el-form-item').filter({ hasText: '戦略的初期化' }).locator('.el-switch').click()

    // Submit
    await page.getByRole('button', { name: '学習を開始' }).click()

    // Verify navigation or success message
    await expect(page.getByText('学習セッション「E2E Test Session」を開始しました')).toBeVisible()
  })
})
