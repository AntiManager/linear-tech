import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Винты трапецеидальные Rosca — цены',
  description: 'Трапецеидальные винты Rosca из стали 40Х, бронзы, капролона. Длина до 6 м, диаметр 8-42 мм. Цены и наличие в Екатеринбурге.',
};

const screws = [
  { type: 'Tr10×3', material: 'Сталь 40Х', price_single: 1200, price_qty: 900, length_max: 3000 },
  { type: 'Tr12×3', material: 'Сталь 40Х', price_single: 1400, price_qty: 1050, length_max: 3000 },
  { type: 'Tr14×4', material: 'Сталь 40Х', price_single: 1600, price_qty: 1200, length_max: 4000 },
  { type: 'Tr16×4', material: 'Сталь 40Х', price_single: 1800, price_qty: 1350, length_max: 4000 },
  { type: 'Tr18×4', material: 'Сталь 40Х', price_single: 2000, price_qty: 1500, length_max: 5000 },
  { type: 'Tr20×4', material: 'Сталь 40Х', price_single: 2200, price_qty: 1650, length_max: 5000 },
  { type: 'Tr22×5', material: 'Сталь 40Х', price_single: 2500, price_qty: 1875, length_max: 6000 },
  { type: 'Tr24×5', material: 'Сталь 40Х', price_single: 2700, price_qty: 2025, length_max: 6000 },
  { type: 'Tr26×5', material: 'Сталь 40Х', price_single: 3000, price_qty: 2250, length_max: 6000 },
  { type: 'Tr28×5', material: 'Сталь 40Х', price_single: 3300, price_qty: 2475, length_max: 6000 },
  { type: 'Tr30×6', material: 'Сталь 40Х', price_single: 3600, price_qty: 2700, length_max: 6000 },
  { type: 'Tr32×6', material: 'Сталь 40Х', price_single: 4000, price_qty: 3000, length_max: 6000 },
  { type: 'Tr36×6', material: 'Сталь 40Х', price_single: 4500, price_qty: 3375, length_max: 6000 },
  { type: 'Tr40×7', material: 'Сталь 40Х', price_single: 5000, price_qty: 3750, length_max: 6000 },
  { type: 'Tr10×3', material: 'Капролон', price_single: 1500, price_qty: 1125, length_max: 2000 },
  { type: 'Tr16×4', material: 'Капролон', price_single: 2100, price_qty: 1575, length_max: 2000 },
  { type: 'Tr20×4', material: 'Капролон', price_single: 2600, price_qty: 1950, length_max: 2000 },
  { type: 'Tr24×5', material: 'Капролон', price_single: 3200, price_qty: 2400, length_max: 2000 },
];

export default function ScrewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/production" className="hover:text-accent">Производство Rosca</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Винты трапецеидальные</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Винты трапецеидальные Rosca</h1>
        <p className="mt-2 text-muted">
          Трапецеидальные винты из стали 40Х, бронзы и капролона. Цены указаны за 1 метр.
          Доступны длины до 6 метров, а также изготовление по чертежам заказчика.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-gray-200 bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-text">Тип резьбы</th>
              <th className="px-4 py-3 text-left font-semibold text-text">Материал</th>
              <th className="px-4 py-3 text-right font-semibold text-text">Цена за 1 м (до 10 шт)</th>
              <th className="px-4 py-3 text-right font-semibold text-text">Цена за 1 м (от 10 шт)</th>
              <th className="px-4 py-3 text-right font-semibold text-text">Макс. длина</th>
              <th className="px-4 py-3 text-center font-semibold text-text">Заказать</th>
            </tr>
          </thead>
          <tbody>
            {screws.map((screw, i) => (
              <tr key={i} className="border-b border-gray-100 transition-colors hover:bg-bg/50">
                <td className="px-4 py-3 font-medium text-text">{screw.type}</td>
                <td className="px-4 py-3 text-muted">{screw.material}</td>
                <td className="px-4 py-3 text-right font-medium text-text">{formatPrice(screw.price_single)}</td>
                <td className="px-4 py-3 text-right font-medium text-text">{formatPrice(screw.price_qty)}</td>
                <td className="px-4 py-3 text-right text-muted">до {screw.length_max} мм</td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/contacts?product=rosca-screw-${screw.type}`}
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
        * Цены указаны за 1 метр длины при заказе от 1 штуки (до 10 шт.) и от 10 штук.
        Возможно изготовление по индивидуальным чертежам. Срок изготовления — от 3 рабочих дней.
      </p>
    </div>
  );
}
