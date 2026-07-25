---
name: nextjs-patterns
description: "Next.js 14+ паттерны: App Router, RSC, SSR/SSG, API Routes, компонентная архитектура, Tailwind CSS"
---

# Next.js Patterns — B2B Industrial Site

## Архитектура

```
src/
├── app/                    # App Router (Next.js 14+)
│   ├── layout.tsx          # Root layout: header, footer, providers
│   ├── page.tsx            # Home page (SSG)
│   ├── catalog/
│   │   ├── page.tsx        # Catalog index (SSG)
│   │   └── [slug]/
│   │       ├── page.tsx    # Category page (SSG)
│   │       └── [product]/page.tsx  # Product detail (SSG + ISR)
│   ├── production/         # Rosca production section
│   ├── about/              # About company
│   ├── news/               # Blog/news
│   ├── contacts/           # Contacts
│   └── api/                # API Routes (backend endpoints)
│       ├── search/route.ts # Product search
│       ├── quote/route.ts  # RFQ submission
│       └── stock/route.ts  # Stock availability
├── components/
│   ├── ui/                 # Reusable UI (buttons, cards, inputs)
│   ├── layout/             # Header, Footer, MegaMenu, MobileMenu
│   ├── catalog/            # ProductCard, ProductGrid, FilterPanel, SearchBar
│   └── sections/           # Page sections (Hero, Features, CTA)
├── lib/
│   ├── api.ts              # Strapi client
│   ├── meilisearch.ts      # Search client
│   └── bitrix24.ts         # CRM integration
└── types/                  # TypeScript types
```

## Ключевые паттерны

### 1. SSG для каталога (предзагрузка при билде)
```tsx
// app/catalog/[slug]/page.tsx
export async function generateStaticParams() {
  const categories = await fetchCategories(); // from Strapi
  return categories.map(c => ({ slug: c.slug }));
}
export const revalidate = 3600; // ISR every hour
```

### 2. Серверные компоненты для контента, клиентские для интерактива
```tsx
// Серверный: загрузка данных, SEO-мета
export default async function CatalogPage({ params }: Props) {
  const products = await fetchProducts(params.slug);
  return (
    <>
      <CatalogSEO category={params.slug} />
      <ProductGrid products={products} />       {/* серверный */}
      <FilterPanel />                             {/* клиентский — 'use client' */}
    </>
  );
}
```

### 3. Tailwind CSS — утилитарные классы
```tsx
// Компонент карточки товара
<div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
  <Image src={product.image} alt={product.name} width={300} height={200} className="rounded-t-lg" />
  <div className="p-4">
    <h3 className="font-semibold text-gray-800">{product.name}</h3>
    <p className="text-sm text-gray-500">{product.series}</p>
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
      {product.inStock ? 'В наличии' : 'Под заказ'}
    </span>
    <div className="mt-2 text-xl font-bold text-red-600">{product.price} ₽</div>
  </div>
</div>
```

### 4. Серверные Actions для форм (замена API routes)
```tsx
// actions/submit-quote.ts
'use server';
export async function submitQuote(formData: FormData) {
  await sendToBitrix24Lead(formData);
  await sendEmailNotification(formData);
  revalidatePath('/admin/quotes');
}
```

### 5. Изображения через next/image
```tsx
<Image src={`https://cdn.linear-tech.ru/products/${product.sku}.webp`}
  width={600} height={400} alt={product.name}
  className="object-contain"
  placeholder="blur" blurDataURL="..." />
```

## SEO
- **generateMetadata()** для динамических meta-тегов
- **JSON-LD schema** через компонент `<Script type="application/ld+json">`
- **Sitemap** через `sitemap.ts` в App Router
- **robots.txt** через `robots.ts`

## Performance цели
- Загрузка главной: <1.5s FCP, <2.5s LCP
- Lighthouse: Perf ≥ 85, SEO = 100, A11y ≥ 90
- Core Web Vitals: все в зоне "Good"
