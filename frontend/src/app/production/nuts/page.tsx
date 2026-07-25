import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Гайки трапецеидальные Rosca — цены',
  description: 'Трапецеидальные гайки Rosca из бронзы, капролона, стали. Все типоразмеры Tr10-Tr40. Цены и наличие в Екатеринбурге.',
};

const nuts = [
  { type: 'Tr10×3', material: 'Бронза', price: 850, price_qty: 680 },
  { type: 'Tr10×3', material: 'Капролон', price: 550, price_qty: 440 },
  { type: 'Tr12×3', material: 'Бронза', price: 950, price_qty: 760 },
  { type: 'Tr12×3', material: 'Капролон', price: 600, price_qty: 480 },
  { type: 'Tr14×4', material: 'Бронза', price: 1100, price_qty: 880 },
  { type: 'Tr14×4', material: 'Капролон', price: 700, price_qty: 560 },
  { type: 'Tr16×4', material: 'Бронза', price: 1250, price_qty: 1000 },
  { type: 'Tr16×4', material: 'Капролон', price: 800, price_qty: 640 },
  { type: 'Tr18×4', material: 'Бронза', price: 1400, price_qty: 1120 },
  { type: 'Tr18×4', material: 'Капролон', price: 900, price_qty: 720 },
  { type: 'Tr20×4', material: 'Бронза', price: 1550, price_qty: 1240 },
  { type: 'Tr20×4', material: 'Капролон', price: 1000, price_qty: 800 },
  { type: 'Tr22×5', material: 'Бронза', price: 1800, price_qty: 1440 },
  { type: 'Tr22×5', material: 'Капролон', price: 1150, price_qty: 920 },
  { type: 'Tr24×5', material: 'Бронза', price: 1950, price_qty: 1560 },
  { type: 'Tr24×5', material: 'Капролон', price: 1250, price_qty: 1000 },
  { type: 'Tr26×5', material: 'Бронза', price: 2200, price_qty: 1760 },
  { type: 'Tr26×5', material: 'Капролон', price: 1400, price_qty: 1120 },
  { type: 'Tr28×5', material: 'Бронза', price: 2400, price_qty: 1920 },
  { type: 'Tr28×5', material: 'Капролон', price: 1550, price_qty: 1240 },
  { type: 'Tr30×6', material: 'Бронза', price: 2700, price_qty: 2160 },
  { type: 'Tr30×6', material: 'Капролон', price: 1750, price_qty: 1400 },
  { type: 'Tr32×6', material: 'Бронза', price: 3000, price_qty: 2400 },
  { type: 'Tr32×6', material: 'Капролон', price: 1950, price_qty: 1560 },
  { type: 'Tr36×6', material: 'Бронза', price: 3500, price_qty: 2800 },
  { type: 'Tr36×6', material: 'Капролон', price: 2250, price_qty: 1800 },
  { type: 'Tr40×7', material: 'Бронза', price: 4000, price_qty: 3200 },
  { type: 'Tr40×7', material: 'Капролон', price: 2600, price_qty: 2080 },
];

export default function NutsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/production" className="hover:text-accent">Производство Rosca</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Гайки трапецеидальные</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Гайки трапецеидальные Rosca</h1>
        <p className="mt-2 text-muted">
          Гайки трапецеидальные из бронзы и капролона для всех типов винтов Rosca.
          Возможно изготовление фланцевых и нестандартных гаек по чертежам.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-gray-200 bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-text">Тип резьбы</th>
              <th className="px-4 py-3 text-left font-semibold text-text">Материал</th>
              <th className="px-4 py-3 text-right font-semibold text-text">Цена (до 10 шт)</th>
              <th className="px-4 py-3 text-right font-semibold text-text">Цена (от 10 шт)</th>
              <th className="px-4 py-3 text-center font-semibold text-text">Заказать</th>
            </tr>
          </thead>
          <tbody>
            {nuts.map((nut, i) => (
              <tr key={i} className="border-b border-gray-100 transition-colors hover:bg-bg/50">
                <td className="px-4 py-3 font-medium text-text">{nut.type}</td>
                <td className="px-4 py-3 text-muted">{nut.material}</td>
                <td className="px-4 py-3 text-right font-medium text-text">{formatPrice(nut.price)}</td>
                <td className="px-4 py-3 text-right font-medium text-text">{formatPrice(nut.price_qty)}</td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/contacts?product=rosca-nut-${nut.type}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Запросить
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-muted">
        * Цены указаны за штуку. Возможно изготовление фланцевых гаек, гаек с буртом
        и других модификаций. Срок изготовления — от 2 рабочих дней.
      </p>
    </div>
  );
}
