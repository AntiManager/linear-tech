import type { Metadata } from 'next';
import Link from 'next/link';
import RFQForm from '@/components/rfq/RFQForm';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Контакты ООО «Линейные системы»: Екатеринбург, ул. Фронтовых Бригад, 18/Б к3-301. Телефон: +7 (343) 382-11-72. Email: info@linear-tech.ru',
};

const workingHours = [
  { day: 'Понедельник — Пятница', hours: '9:00 — 18:00' },
  { day: 'Суббота', hours: 'Выходной' },
  { day: 'Воскресенье', hours: 'Выходной' },
];

export default function ContactsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Контакты</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-text">Контакты</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Наш адрес</h2>
            <p className="text-text/80">
              620141, г. Екатеринбург, ул. Фронтовых Бригад, 18/Б к3-301, офис 301
            </p>
          </section>

          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Телефоны</h2>
            <div className="space-y-2">
              <a href="tel:+73433821172" className="block text-lg font-semibold text-accent hover:underline">
                +7 (343) 382-11-72
              </a>
              <a href="tel:88005052718" className="block text-lg font-semibold text-accent hover:underline">
                8-800-505-27-18
              </a>
              <a href="tel:+73433102718" className="block text-lg font-semibold text-accent hover:underline">
                +7 (343) 310-27-18
              </a>
            </div>
          </section>

          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Email</h2>
            <a href="mailto:info@linear-tech.ru" className="text-accent hover:underline">
              info@linear-tech.ru
            </a>
            <p className="mt-1 text-sm text-muted">
              По вопросам заказов и сотрудничества
            </p>
            <a href="mailto:rosca@linear-tech.ru" className="mt-2 block text-accent hover:underline">
              rosca@linear-tech.ru
            </a>
            <p className="text-sm text-muted">Производство Rosca</p>
          </section>

          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Режим работы</h2>
            <dl className="space-y-2">
              {workingHours.map((wh) => (
                <div key={wh.day} className="flex justify-between text-sm">
                  <dt className="text-text">{wh.day}</dt>
                  <dd className="font-medium text-muted">{wh.hours}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Схема проезда</h2>
            <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-200">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=60.6122%2C56.8380&z=16&mode=search&text=%D1%83%D0%BB.%20%D0%A4%D1%80%D0%BE%D0%BD%D1%82%D0%BE%D0%B2%D1%8B%D1%85%20%D0%91%D1%80%D0%B8%D0%B3%D0%B0%D0%B4%2C%2018%2F%D0%91%20%D0%BA3-301%2C%20%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Яндекс.Карта — ООО Линейные системы"
              />
            </div>
          </section>

          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Написать нам</h2>
            <RFQForm />
          </section>
        </div>
      </div>
    </div>
  );
}
