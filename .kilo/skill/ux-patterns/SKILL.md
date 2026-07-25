---
name: ux-patterns
description: "Лучшие UI/UX практики 2026: B2B адаптивный дизайн, mobile-first, accessibility (WCAG 2.2), responsive patterns"
---

# UI/UX Best Practices 2026 — B2B Industrial Site

## 1. Design System

### Atomic Design
```
Tokens → Atoms → Molecules → Organisms → Templates → Pages
colors   Button   SearchBar   MegaMenu     Catalog     /catalog/hg
spacing  Input    ProductCard FilterPanel  Layout      /product/hg25
fonts    Badge    PriceTag    RFQForm      Header
shadows  Icon     Breadcrumb               Footer
```

### Цветовая система
```css
@layer theme {
  :root {
    /* Primary — industrial blue */
    --color-primary-900: #0D1B2A;
    --color-primary-700: #1B2838;
    --color-primary-500: #415A77;
    --color-primary-300: #778DA9;
    --color-primary-100: #E0E1DD;
    /* Accent — industrial red */
    --color-accent:     #E63946;
    --color-accent-hover: #C1121F;
    /* Semantic */
    --color-success:    #2A9D8F;
    --color-warning:    #E9C46A;
    --color-error:      #E76F51;
    --color-info:       #457B9D;
    /* Neutral */
    --color-bg:         #F8F9FA;
    --color-surface:    #FFFFFF;
    --color-border:     #DEE2E6;
    --color-text:       #212529;
    --color-text-muted: #6C757D;
  }
}
```

---

## 2. Responsive Design — Mobile First

### Breakpoints (Tailwind CSS 4)
```css
/* Tailwind 4 default breakpoints */
sm:  640px   — landscape phones
md:  768px   — tablets
lg:  1024px  — small laptops
xl:  1280px  — desktops
2xl: 1536px  — large screens

/* Custom B2B */
print: — print stylesheet (для КП и счетов)
```

### Паттерны адаптации

| Элемент | Mobile (<768px) | Tablet (768-1024) | Desktop (1024+) |
|---------|----------------|-------------------|-----------------|
| **Навигация** | Bottom sheet / hamburger | Horizontal tabs | Mega-menu dropdown |
| **Каталог** | 1 колонка, sticky filter button | 2 колонки | 3-4 колонки + sidebar filter |
| **Фильтры** | Full-screen bottom sheet | Slide-in panel | Sticky sidebar |
| **Поиск** | Full-width, top of page | Header bar | Header bar with autocomplete |
| **Карточка товара** | Stacked (картинка сверху) | Side-by-side | Side-by-side + specs table |
| **Таблицы** | Horizontal scroll + sticky column 1 | Full table | Full table + sort |
| **Корзина** | Slide-out panel | Slide-out panel | Persistent sidebar |
| **Формы** | Single-column, large inputs | 2 columns | 2-3 columns |
| **Контакты** | Fixed bottom CTA button | In header | In header + footer |

### Mobile-first CSS
```css
/* Mobile first: начинаем с мобильной вёрстки, затем расширяем */
.product-grid {
  display: grid;
  grid-template-columns: 1fr;           /* mobile */
  gap: 1rem;
  padding: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  /* tablet */
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);  /* small desktop */
    padding: 2rem;
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);  /* large desktop */
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

---

## 3. Accessibility (WCAG 2.2 AA — минимум)

### Ключевые требования
```tsx
// 1. Семантический HTML
<nav aria-label="Основное меню">      {/* не <div class="nav"> */}
<main>                                {/* не <div class="content"> */}
<article>                             {/* для статей */}
<aside aria-label="Фильтры">          {/* боковая панель */}

// 2. ARIA-атрибуты для интерактивных элементов
<button aria-expanded={isOpen} aria-controls="mega-menu">
  Каталог
</button>

// 3. Фокус и клавиатурная навигация
// Все интерактивные элементы должны быть доступны с Tab
// Порядок фокуса должен следовать визуальному порядку
// Skip-to-content ссылка в начале страницы

// 4. Контрастность (минимум 4.5:1 для текста, 3:1 для крупного)
// Primary-700 (#1B2838) на bg (#F8F9FA) = 13.5:1 ✅

// 5. Alt-тексты для ВСЕХ изображений
<Image src={product.image} alt={`${product.series} — ${product.name}`} />

// 6. Формы с label
<label htmlFor="search">Поиск по артикулу</label>
<input id="search" type="search" aria-describedby="search-hint" />
<span id="search-hint">Например: HG25, FSI32-10</span>
```

### Инструменты проверки
- **axe-core** (npm) — автоматическое тестирование доступности
- **Lighthouse** (встроен в Chrome DevTools)
- **WAVE** (расширение браузера)
- **Screen reader** тестирование (NVDA / VoiceOver)

---

## 4. Performance UX

```tsx
// 1. Skeleton loaders вместо спиннеров
<div className="animate-pulse">
  <div className="bg-gray-200 h-48 rounded-lg" />       {/* placeholder картинки */}
  <div className="bg-gray-200 h-4 w-3/4 mt-4 rounded" /> {/* placeholder названия */}
  <div className="bg-gray-200 h-4 w-1/2 mt-2 rounded" /> {/* placeholder цены */}
</div>

// 2. Optimistic UI для корзины
const [cartItems, setCartItems] = useState([]);
async function addToCart(product) {
  setCartItems(prev => [...prev, product]);     // мгновенно показать
  await api.addToCart(product.id);              // затем подтвердить
  // при ошибке — rollback с toast-уведомлением
}

// 3. Progressive Loading
<Suspense fallback={<CatalogSkeleton />}>
  <ProductGrid />          {/* загружается сразу (SSR) */}
</Suspense>
<Suspense fallback={<FilterSkeleton />}>
  <FilterPanel />          {/* загружается после (CSR) */}
</Suspense>
```

---

## 5. Микро-взаимодействия (Micro-interactions)

```tsx
// 1. Мгновенный поиск с debounce 300ms
// 2. Подсветка активного фильтра
// 3. Анимация добавления в корзину (scale + fade)
// 4. Toast-уведомления (не модальные окна)
// 5. Pull-to-refresh на мобильных

// Но не перебарщивать! B2B-пользователи ценят скорость > анимации.
// Все анимации должны быть < 200ms и отключаться через prefers-reduced-motion.
```

---

## 6. Тренды 2026

- **Glassmorphism 2.0** — размытые фоны с цветовым акцентом (для hero-секций)
- **Dark mode** — toggle в футере/настройках (инженеры часто работают ночью)
- **Bento grids** — асимметричные сетки как у Apple (для статей, кейсов)
- **Variable fonts** — один файл шрифта вместо 4-х (Inter Variable, 400-700)
- **View Transitions API** — нативные переходы между страницами (Next.js 16 поддерживает)
- **CSS Container Queries** — адаптация компонента по размеру контейнера, а не вьюпорта (Tailwind 4)
- **Scroll-driven animations** — анимации привязанные к скроллу (для лендингов)
