import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'О компании',
  description: 'ООО «Линейные системы» — дистрибьютор HIWIN в Екатеринбурге. Собственное производство Rosca. 14 лет на рынке промышленной механики.',
};

const certificates = [
  { title: 'Сертификат дилера HIWIN 2025', file: '/cert/hiwin-2025.pdf' },
  { title: 'Сертификат дилера HIWIN 2026', file: '/cert/hiwin-2026.pdf' },
  { title: 'Сертификат соответствия Rosca', file: '/cert/rosca-iso.pdf' },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">О компании</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-text">О компании</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">14 лет на рынке промышленной механики</h2>
            <div className="space-y-4 text-text/80 leading-relaxed">
              <p>
                ООО «Линейные системы» — официальный дистрибьютор HIWIN в Уральском регионе.
                С 2008 года мы поставляем линейные направляющие, шарико-винтовые пары,
                линейные актуаторы и другое промышленное оборудование на предприятия
                Урала, Сибири и всей России.
              </p>
              <p>
                В 2016 году мы запустили собственное производство трапецеидальных винтов
                под брендом Rosca. Продукция Rosca — это импортозамещение с Урала:
                винты длиной до 6 метров, диаметром от 8 до 42 мм из стали 40Х,
                бронзы и капролона. Склад готовой продукции — более 15 тонн.
              </p>
              <p>
                Наши клиенты — предприятия машиностроения, станкостроения,
                автоматизации и логистики. Мы обеспечиваем не только поставки,
                но и инженерную поддержку, подбор аналогов, сервисное обслуживание
                и срочный ремонт оборудования HIWIN, THK, NSK, Bosch Rexroth.
              </p>
            </div>
          </section>

          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Сертификаты</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {certificates.map((cert) => (
                <a
                  key={cert.title}
                  href={cert.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-card border border-gray-200 bg-bg p-4 transition-shadow hover:shadow-sm"
                >
                  <svg className="h-8 w-8 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-text">{cert.title}</span>
                </a>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Реквизиты</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-muted">Полное наименование</dt>
                <dd className="text-text">ООО «Линейные системы»</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">ИНН</dt>
                <dd className="text-text">6670464940</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">КПП</dt>
                <dd className="text-text">667001001</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">ОГРН</dt>
                <dd className="text-text">1186658054321</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Юридический адрес</dt>
                <dd className="text-text">620141, г. Екатеринбург, ул. Фронтовых Бригад, 18/Б к3-301, офис 301</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Расчётный счёт</dt>
                <dd className="text-text">40702810800000000000</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Банк</dt>
                <dd className="text-text">АО «Тинькофф Банк»</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">БИК</dt>
                <dd className="text-text">044525974</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
