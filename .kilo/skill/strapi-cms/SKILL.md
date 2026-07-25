---
name: strapi-cms
description: "Strapi 5 Headless CMS: content types, API, admin, media, integration with Next.js"
---

# Strapi 5 CMS — Content Architecture for Linear Tech

## Content Types

### Product (Товар)
```typescript
// schema.json
{
  "kind": "collectionType",
  "collectionName": "products",
  "attributes": {
    "name":           { "type": "string", "required": true },       // FSI32-10
    "slug":           { "type": "uid", "targetField": "name" },     // fsi32-10
    "article":        { "type": "string" },                         // артикул
    "series":         { "type": "string" },                         // FSI, HG, RG
    "brand":          { "type": "enumeration", "enum": ["hiwin", "rosca", "delta", "estun", "item", "other"] },
    "category":       { "type": "relation", "target": "api::category.category" },
    "description":    { "type": "richtext" },                       // полное описание
    "short_desc":     { "type": "text" },                           // краткое (карточка)
    "specs":          { "type": "json" },                           // { diameter: 32, pitch: 10, accuracy: "C7", load: 15000, ... }
    "image":          { "type": "media", "allowedTypes": ["images"] },
    "pdf_catalog":    { "type": "media", "allowedTypes": ["files"] },
    "cad_model":      { "type": "media", "allowedTypes": ["files"] },
    "price":          { "type": "decimal" },                        // розничная цена
    "price_opt":      { "type": "decimal" },                        // оптовая (для кабинета)
    "stock_status":   { "type": "enumeration", "enum": ["in_stock", "on_order", "out_of_stock"] },
    "stock_qty":      { "type": "integer", "min": 0 },
    "delivery_days":  { "type": "integer" },                        // срок поставки (дней)
    "seo_title":      { "type": "string" },
    "seo_desc":       { "type": "text" },
    "seo_keywords":   { "type": "text" },
    "published":      { "type": "boolean", "default": true },
    "featured":       { "type": "boolean", "default": false },
    "analogues":      { "type": "relation", "target": "api::product.product" }  // THK → HIWIN аналоги
  }
}
```

### Category (Категория)
```typescript
{
  "kind": "collectionType",
  "collectionName": "categories",
  "attributes": {
    "name":       { "type": "string", "required": true },    // Направляющие HIWIN
    "slug":       { "type": "uid", "targetField": "name" },  // napravlyajushchie-hiwin
    "description":{ "type": "richtext" },
    "parent":     { "type": "relation", "target": "api::category.category" },
    "children":   { "type": "relation", "target": "api::category.category" },
    "image":      { "type": "media" },
    "products":   { "type": "relation", "target": "api::product.product" },
    "order":      { "type": "integer", "default": 0 },       // порядок сортировки
    "seo_title":  { "type": "string" },
    "seo_desc":   { "type": "text" },
    "is_rosca":   { "type": "boolean", "default": false }    // категория Rosca?
  }
}
```

### Article / Blog Post (Статья)
```typescript
{
  "kind": "collectionType",
  "collectionName": "articles",
  "attributes": {
    "title":       { "type": "string", "required": true },
    "slug":        { "type": "uid", "targetField": "title" },
    "content":     { "type": "richtext" },
    "excerpt":     { "type": "text" },
    "cover":       { "type": "media" },
    "category":    { "type": "enumeration", "enum": ["news", "tech_guide", "comparison", "case_study"] },
    "related_products": { "type": "relation", "target": "api::product.product" },
    "published_at":{ "type": "datetime" }
  }
}
```

### Order / Lead (Заявка / Лид)
```typescript
{
  "kind": "collectionType",
  "collectionName": "orders",
  "attributes": {
    "company":     { "type": "string" },
    "inn":         { "type": "string" },
    "contact_name":{ "type": "string", "required": true },
    "phone":       { "type": "string", "required": true },
    "email":       { "type": "email" },
    "items":       { "type": "json" },                       // [{ productId, qty, price }]
    "comment":     { "type": "text" },
    "attachment":  { "type": "media" },                      // файл спецификации
    "status":      { "type": "enumeration", "enum": ["new", "processing", "sent", "closed", "cancelled"] },
    "bitrix_lead_id": { "type": "integer" },                 // ID лида в Битрикс24
    "total_amount":{ "type": "decimal" },
    "source":      { "type": "string" }                      // website / phone / email / exhibition
  }
}
```

### FAQ Item
```typescript
{
  "kind": "collectionType",
  "collectionName": "faqs",
  "attributes": {
    "question":   { "type": "text", "required": true },
    "answer":     { "type": "richtext", "required": true },
    "category":   { "type": "relation", "target": "api::category.category" },
    "order":      { "type": "integer" }
  }
}
```

---

## API Patterns

### Запрос к Strapi из Next.js (серверный компонент)
```typescript
// lib/strapi.ts
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export async function fetchProducts(categorySlug: string) {
  const res = await fetch(
    `${STRAPI_URL}/api/products?` +
    new URLSearchParams({
      'filters[category][slug][$eq]': categorySlug,
      'populate': 'image,pdf_catalog,category',
      'pagination[limit]': '50',
      'sort': 'order:asc'
    }),
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      next: { revalidate: 3600 } } // ISR: перепроверять каждый час
  );
  const data = await res.json();
  return data.data;
}

export async function fetchProduct(slug: string) {
  const res = await fetch(
    `${STRAPI_URL}/api/products?filters[slug][$eq]=${slug}&populate=*`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return data.data[0] || null;
}

export async function fetchCategories() {
  const res = await fetch(
    `${STRAPI_URL}/api/categories?populate=children,image&sort=order:asc`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      next: { revalidate: 86400 } } // один раз в сутки
  );
  return (await res.json()).data;
}
```

### Next.js → Серверный компонент каталога
```tsx
// app/catalog/[slug]/page.tsx
import { fetchCategories, fetchProducts } from '@/lib/strapi';

// SSG: пререндерить все категории при билде
export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((c: any) => ({ slug: c.attributes.slug }));
}

export default async function CatalogPage({ params }: { params: { slug: string } }) {
  const products = await fetchProducts(params.slug);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{/* Название категории */}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Admin Panel (Strapi)

- Доступ: `https://linear-tech.ru/admin` (или отдельный поддомен)
- Роли: SuperAdmin (разработчик), Editor (менеджер по контенту), Viewer
- Плагины:
  - `@strapi/plugin-seo` — SEO-мета для контента
  - `@strapi/plugin-sitemap` — авто-генерация sitemap
  - `@strapi/plugin-meilisearch` — синхронизация с поиском
  - `@strapi/plugin-i18n` — если потребуется мультиязычность

---

## Важные моменты

1. **API Token** — создаётся в Strapi Admin → Settings → API Tokens. Используется в Next.js для защищённых запросов.
2. **Media Library** — Strapi хранит изображения локально (или S3/MinIO для продакшена). Next.js проксирует через `next/image`.
3. **Webhooks** — при изменении товара → POST на `/api/revalidate` Next.js (обновление ISR-кеша).
4. **Rate limiting** — Strapi middleware для защиты от DDoS.
5. **Backup** — pg_dump для БД + tar для uploads. Ежедневно через cron.
