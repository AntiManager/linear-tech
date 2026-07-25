import { test, expect } from '@playwright/test';

test.describe('Главный механик Виктор', () => {
  test('срочный поиск ШВП по маркировке', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Поиск по артикулу').fill('FSI32-10');
    await page.keyboard.press('Enter');

    await expect(page.locator('.product-card').first()).toBeVisible();
  });
});
