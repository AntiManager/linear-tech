import Link from 'next/link';
import type { Category } from '@/types';

const quickLinks = [
  { name: 'Каталог', href: '/catalog' },
  { name: 'Производство Rosca', href: '/rosca' },
  { name: 'О компании', href: '/about' },
  { name: 'Контакты', href: '/contacts' },
  { name: 'Новости', href: '/news' },
  { name: 'Запросить КП', href: '/rfq' },
];

interface FooterProps {
  categories?: Category[];
}

export default function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">ООО «Линейные системы»</h3>
            <p className="mb-2 text-sm text-white/70">
              Екатеринбург, ул. Фронтовых Бригад, 18/Б к3-301, офис 301
            </p>
            <a href="tel:+73433821172" className="block text-sm text-white/70 hover:text-white">
              +7 (343) 382-11-72
            </a>
            <a href="tel:88005052718" className="block text-sm text-white/70 hover:text-white">
              8-800-505-27-18
            </a>
            <a href="mailto:info@linear-tech.ru" className="block text-sm text-white/70 hover:text-white">
              info@linear-tech.ru
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Быстрые ссылки</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Каталог продукции</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {(categories && categories.length > 0 ? categories : [
                { name: 'Направляющие HIWIN', slug: 'profilnie-napravlyajushie' },
                { name: 'ШВП HIWIN', slug: 'shariko-vintovye-peredachi-shvp' },
                { name: 'Актуаторы HIWIN', slug: 'actuators-hiwin' },
                { name: 'Модули HIWIN', slug: 'linear-modules-hiwin' },
                { name: 'Сервопривод', slug: 'servodrives' },
                { name: 'Шаговый привод', slug: 'shagovyj-privod' },
                { name: 'Алюминиевый профиль', slug: 'alyuminievyj-profil' },
                { name: 'Подшипники скольжения', slug: 'podshipniki-skolzheniya' },
                { name: 'Прецизионные валы', slug: 'pretsizionnye-valy' },
                { name: 'Соединительные муфты', slug: 'soedinitelnye-mufty' },
                { name: 'Виброопоры', slug: 'promyshlennye-vibroopory' },
                { name: 'Подшипники качения', slug: 'linyeinye-podshipniki-kacheniya' },
                { name: 'Рейки и шестерни', slug: 'zubchatye-rejki-i-shesterni' },
                { name: 'Трапецеидальные винты', slug: 'trapetseidalnye-khodovye-vinty-i-gajki' },
                { name: 'Роликовые направляющие', slug: 'rolikovie-lineinie-peremecheniya' },
                { name: 'Шарнирные наконечники', slug: 'sharnirnye-nakonechniki' },
                { name: 'Шлицевые направляющие', slug: 'shlitsevye-napravlyayushchie' },
              ]).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog/${cat.slug}`}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © 2008-2026 Линейные системы
        </div>
      </div>
    </footer>
  );
}
