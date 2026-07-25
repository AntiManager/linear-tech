import { test, expect } from '@playwright/test';

test.describe('Инженер-конструктор Алексей', () => {
  test('подбор направляющих HG25 для нового станка', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Поиск по артикулу').fill('HG25');
    await page.keyboard.press('Enter');

    await expect(page.locator('.product-card').first()).toBeVisible();
  });
});
