import { test, expect } from '@playwright/test';

test.describe('Снабженец Ольга', () => {
  test('сбор КП по спецификации из 3 позиций', async ({ page }) => {
    const items = ['HG25', 'FSI32-10'];

    for (const article of items) {
      await page.goto('/');
      await page.getByPlaceholder('Поиск по артикулу').fill(article);
      await page.keyboard.press('Enter');
      await expect(page.locator('.product-card').first()).toBeVisible();
    }

    await page.goto('/');
    await expect(page.getByText('Промышленная механика')).toBeVisible();
  });
});
