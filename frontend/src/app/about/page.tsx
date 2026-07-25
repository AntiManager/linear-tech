import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'О компании',
  description: 'ООО «Линейные системы» — уральский представитель официальных дистрибьюторов HIWIN и Item в России. Собственное производство Rosca. Склад в Екатеринбурге.',
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
            <h2 className="mb-4 text-xl font-bold text-text">
              Уральский представитель официальных дистрибьюторов HIWIN и Item в России
            </h2>

            <div className="space-y-6 text-text/80 leading-relaxed">
              <div>
                <h3 className="mb-2 font-semibold text-text">Цель создания</h3>
                <p>
                  Для производственных, проектировочных и ремонтных предприятий Урала,
                  мы стремимся облегчить поиск, подбор и приобретение комплектующих
                  промышленной механики и мехатроники. Поставляемые комплектующие должны
                  быть недорогими, доступными и качественными. Приобретение должно быть
                  простым, удобным и взаимовыгодным: заявка — оплата — получение.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-text">Что нами движет?</h3>
                <p>
                  При производстве специального оборудования под заказ мы часто сталкивались
                  с проблемой существования сроков поставки, которые дополнительно оттягивают
                  сроки сдачи продукции заказчику. Поддержание склада комплектующих для
                  небольших организаций довольно накладно, так как заранее неизвестно,
                  что именно понадобится в первую очередь, а большие деньги
                  замораживать на складе нет никакого резона.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-text">Верное решение и первые шаги</h3>
                <p>
                  В целях облегчения жизни и работы собственного узконаправленного производства,
                  а также аналогичных компаний было принято решение о создании склада
                  комплектующих в г. Екатеринбург. Начиная с 2011-го года нами организован
                  специализированный склад продукции HIWIN и других производителей
                  качественных комплектующих на территории Уральского Дизель-Моторного завода.
                  Также с конца 2011-го года налажены поставки алюминиевого станочного
                  профиля и сопутствующих аксессуаров от немецкого производителя
                  Item Industrietechnik und Maschinenbau GmbH, при сохранении
                  минимальных сроков поставки.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-text">Дальнейшее развитие</h3>
                <p>
                  Освоено производство ходовых винтов, гаек и сопутствующей продукции
                  на производственной площадке в г. Екатеринбург. Для расширения
                  ассортимента выпускаемых типоразмеров приобретается дополнительное
                  оборудование и инструмент. Для обеспечения различных потребностей
                  предприятий и ценовых ожиданий заказчиков применяются различные
                  технологии производства резьбовых поверхностей. Особое внимание
                  мы уделяем качеству производимой продукции.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-text">Ваша уверенность</h3>
                <p>
                  Мы осуществляем поставки только оригинальной продукции исключительно
                  от официальных дистрибьюторов в РФ — что обеспечивает нашим заказчикам
                  отсутствие ценовых накруток и минимизацию транспортных и таможенных
                  издержек.
                </p>
                <p className="mt-2">
                  Важнейшими приоритетами нашей работы мы считаем: чёткую организацию
                  логистики, поддержание порядка в информационной и документальной сферах,
                  согласованность действий персонала и руководящего состава компании,
                  ответственность за взятые на себя обязательства.
                </p>
              </div>
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
