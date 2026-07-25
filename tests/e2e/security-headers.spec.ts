import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('security headers присутствуют', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const headers = response!.headers();

    expect(headers).toHaveProperty('x-content-type-options');
    expect(headers).toHaveProperty('x-frame-options');

    await expect(page.getByText(/Линейные системы/i)).toBeVisible();
  });
});
