import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import { fetchCategories, fetchArticles } from '@/lib/strapi';
import type { Category, Article } from '@/types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '').trim();
}

function categoryDesc(html: string | undefined, maxLen = 140): string {
  const text = stripHtml(html || '');
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

function catImageUrl(cat: Category): string | null {
  const img = cat.image;
  if (!img) return null;
  return img.formats?.small?.url || img.formats?.thumbnail?.url || img.url;
}

export default async function HomePage() {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {}

  let articles: Article[] = [];
  try {
    articles = await fetchArticles();
  } catch {}

  const featuredArticles = articles.slice(0, 3);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/60">
            Урал &middot; Екатеринбург
          </p>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Официальный представитель{' '}
            <span className="text-accent">HIWIN</span> в России
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            Компоненты промышленной механики со склада в Екатеринбурге.
            Направляющие, ШВП, актуаторы, сервоприводы Delta и Estun.
            Собственное производство Rosca. Инженерная поддержка.
          </p>
          <div className="mx-auto flex max-w-xl justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ===== ALL CATEGORIES WITH REAL IMAGES ===== */}
      {categories.length > 0 && (
        <section className="bg-surface py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-bold text-text">Каталог продукции</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const img = catImageUrl(cat);
                return (
                  <Link
                    key={cat.slug}
                    href={`/catalog/${cat.slug}`}
                    className="group flex flex-col overflow-hidden rounded-card border border-gray-200 bg-bg transition-shadow hover:shadow-md"
                  >
                    {/* Category image */}
                    <div className="flex h-40 items-center justify-center bg-gray-50 p-4">
                      {img ? (
                        <img
                          src={img}
                          alt={cat.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary/5">
                          <svg className="h-12 w-12 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Text content */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-semibold text-text group-hover:text-accent">
                        {cat.name}
                      </h3>
                      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">
                        {categoryDesc(cat.description, 120)}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        Перейти к сериям
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== СРОЧНЫЙ РЕМОНТ ===== */}
      <section className="bg-accent py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Срочный ремонт и сервис</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/90">
            Восстановим ШВП, направляющие, актуаторы. Диагностика — от 1 часа.
            Работаем с оборудованием HIWIN, THK, NSK, Bosch Rexroth.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacts" className="rounded-btn bg-white px-6 py-3 font-semibold text-accent transition-colors hover:bg-white/90">
              Связаться с инженером
            </Link>
            <a href="tel:+73433821172" className="rounded-btn border-2 border-white px-6 py-3 font-semibold transition-colors hover:bg-white/10">
              +7 (343) 382-11-72
            </a>
          </div>
        </div>
      </section>

      {/* ===== ROSCA ===== */}
      <section className="bg-surface py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="flex-1">
              <h2 className="mb-4 text-2xl font-bold text-text">
                Rosca — собственное производство
              </h2>
              <p className="mb-4 text-text/80">
                Трапецеидальные винты и гайки со склада в Екатеринбурге.
                Сталь 40Х, бронза, капролон. Длина до 6 метров, диаметр 8–42 мм.
                Импортозамещение с Урала с 2016 года.
              </p>
              <Link href="/production" className="inline-flex items-center gap-2 font-semibold text-accent hover:underline">
                Перейти в каталог Rosca
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                {['Винты трапецеидальные', 'Гайки трапецеидальные', 'Заказные размеры', 'Склад 15+ тонн'].map((item) => (
                  <div key={item} className="rounded-card bg-bg p-4 text-center text-sm font-medium text-text">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST SIGNALS ===== */}
      <section className="bg-bg py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: 'с 2011', label: 'На рынке' },
              { value: '15+ тонн', label: 'Складской запас' },
              { value: '17 категорий', label: 'Продукции' },
              { value: 'Пн–Пт 9-18', label: 'Время работы' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-primary">{item.value}</div>
                <div className="mt-1 text-sm text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWS ===== */}
      {featuredArticles.length > 0 && (
        <section className="bg-surface py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text">Новости и статьи</h2>
              <Link href="/news" className="text-sm font-semibold text-accent hover:underline">
                Все статьи
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group rounded-card border border-gray-200 bg-bg overflow-hidden transition-shadow hover:shadow-md"
                >
                  {article.cover && (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={article.cover.url}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <time className="text-xs text-muted">
                      {new Date(article.published_at).toLocaleDateString('ru-RU')}
                    </time>
                    <h3 className="mt-1 font-semibold text-text group-hover:text-accent line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
