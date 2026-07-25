import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import { fetchCategories, fetchArticles } from '@/lib/strapi';
import type { Category, Article } from '@/types';

const categories: { name: string; slug: string; icon: string; desc: string }[] = [
  { name: 'Линейные направляющие', slug: 'lineynye-napravlyayushchie', icon: 'M4 6h16M4 12h16M4 18h16', desc: 'HIWIN, рельсы, каретки, блоки' },
  { name: 'Шарико-винтовые пары (ШВП)', slug: 'sharikovintovye-pary-shvp', icon: 'M12 4v16M4 12h16', desc: 'ШВП HIWIN, гайки, фланцы' },
  { name: 'Линейные актуаторы', slug: 'lineynye-aktuary', icon: 'M5 12h14M12 5l7 7-7 7', desc: 'Электрические цилиндры' },
  { name: 'Сервоприводы Delta', slug: 'servoprivody', icon: 'M13 10V3L4 14h7v7l9-11h-7z', desc: 'Drake серии ASD-A2, B2' },
  { name: 'Муфты и тормоза', slug: 'mufty-i-tormoza', icon: 'M8 7h8M8 12h8M8 17h8', desc: 'Соединительные муфты' },
  { name: 'Ремни и шкивы', slug: 'remni-i-shkivy', icon: 'M4 12a8 8 0 0116 0', desc: 'Зубчатые ремни, шкивы' },
];

const iconPaths: Record<string, string> = {
  'lineynye-napravlyayushchie': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'sharikovintovye-pary-shvp': 'M12 2l-5 5h3v10H7l5 5 5-5h-3V7h3L12 2z',
  'lineynye-aktuary': 'M9 9l10-5-5 10-5-5zm-4 5l4 4-4 4-4-4 4-4z',
  'servoprivody': 'M13 10V3L4 14h7v7l9-11h-7z',
  'mufty-i-tormoza': 'M12 2a10 10 0 1010 10M12 2v4m0 0a6 6 0 016 6h-4m-2-2l4-4',
  'remni-i-shkivy': 'M4 12a8 8 0 0116 0M4 12a8 8 0 0016 0',
};

export default async function HomePage() {
  let articles: Article[] = [];
  try {
    articles = await fetchArticles();
  } catch {}

  const featuredArticles = articles.slice(0, 3);

  return (
    <>
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Промышленная механика со склада в России
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            Официальная продукция HIWIN, собственное производство Rosca.
            Направляющие, ШВП, актуаторы, сервоприводы Delta, Estun.
            Цены, наличие, инженерная поддержка.
          </p>
          <div className="mx-auto flex max-w-xl justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold text-text">Категории продукции</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/${cat.slug}`}
                className="group flex items-start gap-4 rounded-card border border-gray-200 bg-bg p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[cat.slug] || 'M4 6h16M4 12h16M4 18h16'} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-text group-hover:text-accent">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-accent py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Срочный ремонт и сервис</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/90">
            Восстановим ШВП, направляющие, актуаторы. Диагностика — от 1 часа.
            Работаем с оборудованием HIWIN, THK, NSK, Bosch Rexroth.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacts" className="rounded-btn bg-white px-6 py-3 font-semibold text-accent transition-colors hover:bg-white/90">
              Срочный вызов
            </Link>
            <a href="tel:+73433821172" className="rounded-btn border-2 border-white px-6 py-3 font-semibold transition-colors hover:bg-white/10">
              +7 (343) 382-11-72
            </a>
          </div>
        </div>
      </section>

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

      {featuredArticles.length > 0 && (
        <section className="bg-bg py-16">
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
                  className="group rounded-card border border-gray-200 bg-surface overflow-hidden transition-shadow hover:shadow-md"
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
