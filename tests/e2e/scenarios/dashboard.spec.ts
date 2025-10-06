import { expect, test } from '@playwright/test'

test.describe('Nuxt welcome experience', () => {
  test('renders the default Nuxt onboarding content', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: /nuxt/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Get started' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Documentation/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Modules/ })).toBeVisible()
  })

  test('exposes external resources for further learning', async ({ page }) => {
    await page.goto('/')

    const docsLink = page.getByRole('link', { name: /Documentation/ }).first()
    await expect(docsLink).toHaveAttribute('href', /nuxt\.com\/docs/i)
    await expect(docsLink).toHaveAttribute('target', '_blank')
  })
})
