import { test, expect } from '@playwright/test';

test.describe('Инженер-конструктор Алексей', () => {
  test('подбор направляющих через каталог', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/промышленная механика|Линейные системы/i)).toBeVisible();

    await page.goto('/catalog');
    await expect(page.getByText(/каталог|продукция/i)).toBeVisible();
  });
});
