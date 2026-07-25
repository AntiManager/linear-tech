import { test, expect } from '@playwright/test';

test.describe('Снабженец Ольга', () => {
  test('просмотр каталога для сбора КП', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/промышленная механика|Линейные системы/i)).toBeVisible();

    await page.goto('/catalog');
    await expect(page.getByText(/каталог|продукция/i)).toBeVisible();
  });
});
