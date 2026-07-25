import { test, expect } from '@playwright/test';

test.describe('Директор Дмитрий', () => {
  test('проверка надёжности поставщика перед сделкой', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Линейные системы|промышленная механика/i)).toBeVisible();

    await page.goto('/about');
    await expect(page.getByText(/сертификат|дилер/i)).toBeVisible();

    await page.goto('/contacts');
    await expect(page.getByText(/\+7.*343/i)).toBeVisible();
  });
});
