---
name: testing-e2e
description: "E2E тестирование Playwright + нагрузочное (k6/artillery) + безопасность (OWASP ZAP). CI/CD интеграция"
---

# Testing Strategy — Linear Tech

## 1. E2E Testing: Playwright

### Установка и конфигурация
```bash
npm init playwright@latest
# Выбрать: TypeScript, tests/ directory, GitHub Actions
```

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Ключевые тесты
```typescript
// tests/e2e/catalog.spec.ts
import { test, expect } from '@playwright/test';

// Поиск по артикулу
test('поиск по артикулу HG25 находит направляющие', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Поиск по артикулу').fill('HG25');
  await page.getByRole('button', { name: 'Найти' }).click();
  await expect(page.getByText('Направляющие HIWIN HG')).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(12);
});

// Фильтрация
test('фильтр по серии отображает только выбранные товары', async ({ page }) => {
  await page.goto('/catalog/naznachenie');
  await page.getByLabel('HG (супер-грузоподъемные)').check();
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByLabel('RG (роликовые)').check();
  await expect(page.locator('.product-card')).toHaveCount(10);
});

// RFQ — запрос КП
test('запрос КП создаёт заявку', async ({ page }) => {
  await page.goto('/catalog/shvp/fsi32-10');
  await page.getByRole('button', { name: 'В корзину' }).click();
  await page.getByRole('button', { name: 'Запросить КП' }).click();
  await page.getByLabel('Название компании').fill('ООО Тест');
  await page.getByLabel('Телефон').fill('+79991234567');
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await expect(page.getByText('Заявка отправлена')).toBeVisible();
});

// Мобильная версия
test('мобильное меню открывается', async ({ page }) => {
  // Playwright эмулирует Pixel 7
  await page.goto('/');
  await page.getByRole('button', { name: 'Меню' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
});

// 404 страница
test('несуществующий URL показывает 404', async ({ page }) => {
  const response = await page.goto('/catalog/nonexistent');
  expect(response?.status()).toBe(404);
});
```

### Тесты для Rosca (цены)
```typescript
test('цены Rosca отображаются публично', async ({ page }) => {
  await page.goto('/production/screws');
  await expect(page.getByText('от 367 ₽/м')).toBeVisible();
  await page.getByRole('row', { name: 'TR20x4R' }).getByText('1 908 ₽/м').toBeVisible();
});
```

---

## 2. Визуальное регрессионное тестирование
```typescript
// tests/visual/home.spec.ts
import { test, expect } from '@playwright/test';

test('главная страница snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-desktop.png', { fullPage: true });
});

test('карточка товара snapshot', async ({ page }) => {
  await page.goto('/catalog/shvp/fsi32-10');
  await expect(page.locator('.product-detail')).toHaveScreenshot('product-fsi32-10.png');
});
```

---

## 3. Нагрузочное тестирование — k6

### Установка
```bash
# Windows (Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

### Сценарий нагрузки
```javascript
// tests/load/catalog.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // разогрев до 50 пользователей
    { duration: '3m', target: 200 },  // пик 200 пользователей
    { duration: '1m', target: 0 },    // спад
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% запросов < 500ms
    http_req_failed: ['rate<0.01'],   // <1% ошибок
  },
};

export default function () {
  // Главная
  const home = http.get('https://linear-tech.ru/');
  check(home, { 'главная 200': (r) => r.status === 200 });
  sleep(1);

  // Каталог
  const catalog = http.get('https://linear-tech.ru/catalog/naznachenie');
  check(catalog, { 'каталог 200': (r) => r.status === 200 });
  sleep(2);

  // Поиск
  const search = http.get('https://linear-tech.ru/api/search?q=HG25');
  check(search, { 'поиск 200': (r) => r.status === 200 });
  sleep(0.5);
}
```

### Artillery (альтернатива)
```yaml
# tests/load/artillery.yml
config:
  target: "https://linear-tech.ru"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
    - duration: 180
      arrivalRate: 50
scenarios:
  - flow:
      - get: { url: "/" }
      - think: 1
      - get: { url: "/catalog/naznachenie" }
      - get: { url: "/api/search?q=HG25" }
```

---

## 4. Тестирование безопасности

### Автоматические проверки в CI/CD
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high

  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: snyk/actions/node@master
        env: { SNYK_TOKEN: '${{ secrets.SNYK_TOKEN }}' }

  trivy-docker:
    runs-on: ubuntu-latest
    steps:
      - uses: aquasecurity/trivy-action@master
        with: { scan-type: 'fs', scan-ref: '.' }
```

### Ручные проверки (OWASP Top 10)
```
[ ] Injection (SQL, NoSQL) — валидация всех API-параметров
[ ] Broken Authentication — JWT refresh, rate-limit на логин
[ ] Sensitive Data Exposure — HTTPS everywhere, HSTS
[ ] XML External Entities (XXE) — отключить парсинг XML
[ ] Broken Access Control — Strapi роли, Next.js middleware
[ ] Security Misconfiguration — CSP, X-Frame-Options, X-Content-Type-Options
[ ] XSS — sanitize HTML в Strapi richtext
[ ] Insecure Deserialization — валидация JSON на API
[ ] Using Vulnerable Components — npm audit + Dependabot
[ ] Insufficient Logging — Winston/Pino + мониторинг
```

### Заголовки безопасности (Next.js)
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" },
];
```

---

## 5. CI/CD интеграция

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage

  e2e:
    runs-on: ubuntu-latest
    needs: [lint-typecheck, unit-test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }

  lighthouse:
    runs-on: ubuntu-latest
    needs: [e2e]
    steps:
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            https://linear-tech.ru/
            https://linear-tech.ru/catalog/naznachenie
            https://linear-tech.ru/production/screws
          budgetPath: .github/lighthouse/budget.json
          uploadArtifacts: true
```
