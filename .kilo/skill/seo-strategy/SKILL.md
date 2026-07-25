---
name: seo-strategy
description: "SEO оптимизация 2026: техническое SEO, контент-стратегия, структурированные данные, раскрутка B2B сайта"
---

# SEO Strategy — Linear Tech (B2B Industrial)

## 1. Техническое SEO

### 1.1. Next.js 16 SEO features
```typescript
// app/layout.tsx — глобальные мета
export const metadata: Metadata = {
  metadataBase: new URL('https://linear-tech.ru'),
  title: { default: 'HIWIN в России — Линейные системы', template: '%s — Линейные системы' },
  description: 'Компоненты промышленной механики HIWIN: рельсовые направляющие, ШВП, актуаторы. Склад в Екатеринбурге. Доставка по РФ.',
  keywords: ['HIWIN', 'направляющие', 'ШВП', 'актуаторы', 'промышленная механика'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'ru_RU', url: 'https://linear-tech.ru',
    siteName: 'Линейные системы', title: 'HIWIN в России — Линейные системы',
    description: 'Промышленная механика со склада в Екатеринбурге',
  },
};

// app/catalog/[slug]/page.tsx — динамические мета
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await fetchCategory(params.slug);
  return {
    title: category.name,
    description: category.seo_desc,
    keywords: category.seo_keywords,
    alternates: { canonical: `/catalog/${params.slug}` },
  };
}
```

### 1.2. Sitemap (авто-генерация)
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await fetchAllCategories();
  const products = await fetchAllProducts();
  const articles = await fetchAllArticles();

  return [
    { url: 'https://linear-tech.ru', lastModified: new Date(), priority: 1.0 },
    { url: 'https://linear-tech.ru/catalog', priority: 0.9 },
    { url: 'https://linear-tech.ru/production', priority: 0.9 },
    ...categories.map(c => ({ url: `https://linear-tech.ru/catalog/${c.slug}`, priority: 0.8 })),
    ...products.map(p => ({ url: `https://linear-tech.ru/catalog/${p.category.slug}/${p.slug}`, priority: 0.7 })),
    ...articles.map(a => ({ url: `https://linear-tech.ru/news/${a.slug}`, priority: 0.6 })),
  ];
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: 'https://linear-tech.ru/sitemap.xml',
  };
}
```

---

## 2. Структурированные данные (Schema.org JSON-LD)

### 2.1. Каталог товаров
```typescript
// components/ProductSchema.tsx
export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_desc,
    sku: product.article,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category.name,
    image: product.image?.url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'RUB',
      availability: product.stock_qty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      seller: { '@type': 'Organization', name: 'ООО "Линейные системы"' },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
```

### 2.2. Другие схемы
```typescript
// Organization (на всех страницах)
'@type': 'Organization',
name: 'ООО "Линейные системы"',
url: 'https://linear-tech.ru',
logo: 'https://linear-tech.ru/logo.svg',
contactPoint: { '@type': 'ContactPoint', telephone: '+7-343-382-11-72', contactType: 'sales' },
address: { '@type': 'PostalAddress', addressCountry: 'RU', addressLocality: 'Екатеринбург', streetAddress: 'ул. Фронтовых Бригад, 18/Б' },

// BreadcrumbList (навигация)
// FAQ (вопросы-ответы)
// Article (статьи и новости)
// LocalBusiness (контакты)
// HowTo (гайды по подбору)
```

---

## 3. Контент-стратегия (SEO Content)

### Кластеры ключевых запросов

**Кластер «Направляющие»**:
- направляющие HIWIN купить
- рельсовые направляющие для ЧПУ
- линейные направляющие цена
- профильные рельсовые направляющие HIWIN HG25
- направляющие HIWIN каталог

**Кластер «ШВП»**:
- ШВП HIWIN купить
- шарико-винтовая передача для станка
- ШВП FSI32-10 цена
- катаная ШВП C7
- замена ШВП на станке

**Кластер «Rosca»**:
- трапецеидальный винт купить
- ходовой винт TR20x4
- винт для ЧПУ станка цена
- гайка трапецеидальная бронзовая
- импортозамещение трапецеидальных винтов
- производство ходовых винтов Россия

**Кластер «Информационные»**:
- как выбрать направляющие для станка
- HIWIN vs THK сравнение
- расчёт ШВП для ЧПУ
- класс точности направляющих C7 H P

### Контент-план (стартовый)
| Тип контента | Количество | Частота |
|-------------|-----------|---------|
| Карточки товаров (17 категорий × ~5 серий) | ~85 | Однократно |
| Технические статьи (гайды по подбору) | 10-15 | 1-2/мес |
| Сравнения (HIWIN vs THK, HG vs RG) | 5-8 | 1/мес |
| FAQ по категориям | 30-50 | По мере поступления вопросов |
| Новости компании | 4-6/год | При событии |

### Структура статьи (оптимизированной под SEO)
```
H1: [Ключевой запрос]
Введение (100-150 слов, LSI-ключи)
H2: Основной раздел 1
  P: Текст + маркированный список
H2: Основной раздел 2
  P: Текст + таблица сравнения
H2: Практический пример (кейс)
H2: FAQ (3-5 вопросов)
Вывод + CTA: «Остались вопросы? Свяжитесь с инженером»
```

---

## 4. Миграция URL (старый Joomla → новый Next.js)

### Таблица редиректов (301)
```typescript
// next.config.ts — redirects
async redirects() {
  return [
    // Главные страницы
    { source: '/about.html', destination: '/about', permanent: true },
    { source: '/contacts.html', destination: '/contacts', permanent: true },
    { source: '/news.html', destination: '/news', permanent: true },
    { source: '/partners.html', destination: '/partners', permanent: true },

    // Категории (17 штук)
    { source: '/profilnie-napravlyajushie.html', destination: '/catalog/naznachenie', permanent: true },
    { source: '/shariko-vintovye-peredachi-shvp.html', destination: '/catalog/shvp', permanent: true },
    { source: '/actuators-hiwin.html', destination: '/catalog/actuators', permanent: true },
    // ... остальные 14 категорий ...

    // Подкатегории
    { source: '/profilnie-napravlyajushie/linear-guide-hiwin-hg.html', destination: '/catalog/naznachenie/hg', permanent: true },
    // ... все подкатегории (~50 штук) ...

    // Производство
    { source: '/trapetseidalnye-khodovye-vinty-i-gajki/izgotovlenie-i-obrabotka.html', destination: '/production', permanent: true },

    // Новости (20 записей)
    { source: '/news/:slug', destination: '/news/:slug', permanent: true }, // прямой маппинг
  ];
}
```

---

## 5. Аналитика и метрики

### Яндекс.Метрика (уже есть, ID: 18313039)
### Google Analytics 4 (создать новый, старый UA не работает с 2024)

```typescript
// app/layout.tsx
import Script from 'next/script';

<Script id="yandex-metrika" strategy="afterInteractive">
  {`(function(m,e,t,r,i,k,a){...})`}
</Script>
<Script id="ga4" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX" strategy="afterInteractive" />
```

---

## 6. Раскрутка сайта

### 6.1. Каналы продвижения

| Канал | Приоритет | Бюджет | Ожидаемый эффект |
|-------|:---:|--------|------------------|
| **SEO (органический поиск)** | P0 | Минимальный | 50-60% трафика |
| **Яндекс.Директ (поиск)** | P0 | 30-50K ₽/мес | 20-30% лидов |
| **Яндекс.Директ (РСЯ)** | P1 | 10-20K ₽/мес | Брендирование, ретаргетинг |
| **МойСклад / Пульс цен** | P1 | Бесплатно | B2B-площадки, прайс-листы |
| **Отраслевые каталоги** | P2 | Бесплатно | Беклинки, доверие |
| **Telegram-каналы** | P2 | 5-10K ₽/мес | Инженерное комьюнити |
| **Выставки** | P3 | 50-100K ₽ | OEM-контракты |

### 6.2. Контекстная реклама (Яндекс.Директ)
```
Кампания 1: «Бренд HIWIN»
Ключи: hiwin купить, направляющие hiwin, швп hiwin, актуатор hiwin
Минус-слова: б/у, бу, отзывы, вакансии, работа

Кампания 2: «ШВП и направляющие» (общие)
Ключи: швп купить, направляющие для чпу, линейные направляющие цена, шарико-винтовая передача
Минус-слова: б/у, бу, своими руками, самодельный

Кампания 3: «Производство Rosca» (импортозамещение)
Ключи: трапецеидальный винт купить, ходовой винт производство, винт tr цена, импортозамещение подшипников
Минус-слова: б/у, бу

Кампания 4: «Гео» (Урал + РФ)
Ключи: направляющие екатеринбург, швп челябинск, подшипники уфа
```

### 6.3. E-mail маркетинг
- **Рассылка каталогов** (1 раз / квартал): новинки, акции, цены
- **Триггерные письма**: брошенная корзина → «У вас остались товары»
- **Реактивация**: клиентам без заказов >6 мес

---

## 7. Lighthouse Budget (цели)

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }],
        "categories:seo": ["error", { "minScore": 1.0 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "speed-index": ["warn", { "maxNumericValue": 2000 }]
      }
    }
  }
}
```
