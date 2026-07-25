import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Производство Rosca — импортозамещение с Урала',
  description: 'Собственное производство трапецеидальных винтов и гаек Rosca. Длина до 6 м, диаметр 8-42 мм. Сталь 40Х, бронза, капролон. Екатеринбург.',
};

export default function ProductionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Производство Rosca</span>
      </nav>

      <section className="mb-12">
        <h1 className="mb-4 text-3xl font-bold text-text">
          Rosca — импортозамещение с Урала
        </h1>
        <p className="max-w-3xl text-lg text-text/80 leading-relaxed">
          С 2016 года мы производим трапецеидальные винты и гайки на собственном
          производстве в Екатеринбурге. Стабильное качество, короткие сроки,
          полный цикл от заготовки до готовой продукции.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Длина до 6 метров', desc: 'Винты любой длины от 0.5 до 6 метров', icon: 'M12 2l-5 5h3v10H7l5 5 5-5h-3V7h3L12 2z' },
          { title: 'Диаметр 8–42 мм', desc: 'Трапецеидальная резьба Tr10–Tr40 по ГОСТ', icon: 'M4 6h16M4 12h16M4 18h16' },
          { title: 'Материалы', desc: 'Сталь 40Х, бронза, капролон', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { title: 'Склад 15+ тонн', desc: 'Постоянное наличие популярных типоразмеров', icon: 'M3 3h18v18H3V3z' },
        ].map((item) => (
          <div key={item.title} className="rounded-card border border-gray-200 bg-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-text">{item.title}</h3>
            <p className="text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-card border border-gray-200 bg-surface p-6">
        <h2 className="mb-4 text-2xl font-bold text-text">Каталог Rosca</h2>
        <p className="mb-6 text-text/80">
          Ознакомьтесь с полным ассортиментом трапецеидальных винтов и гаек Rosca.
          Цены указаны на сайте, возможна оперативная отгрузка со склада.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/production/screws"
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Винты трапецеидальные
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/production/nuts"
            className="inline-flex items-center gap-2 rounded-btn border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Гайки трапецеидальные
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
