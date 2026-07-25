import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Партнёры и бренды',
  description: 'Официальные партнёры: HIWIN, Delta Electronics, Estun Automation, Item International и другие.',
};

const partners = [
  { name: 'HIWIN', logo: '/partners/hiwin.svg', desc: 'Линейные направляющие, ШВП, актуаторы, линейные двигатели' },
  { name: 'Delta Electronics', logo: '/partners/delta.svg', desc: 'Сервоприводы, ПЛК, частотные преобразователи, сенсорные панели' },
  { name: 'Estun Automation', logo: '/partners/estun.svg', desc: 'Сервоприводы, контроллеры движения, промышленные роботы' },
  { name: 'Item International', logo: '/partners/item.svg', desc: 'Алюминиевый профиль, конструкционные системы' },
  { name: 'Rosca', logo: '/partners/rosca.svg', desc: 'Собственное производство трапецеидальных винтов и гаек' },
  { name: 'Schneider Electric', logo: '/partners/schneider.svg', desc: 'Электрооборудование, автоматизация' },
];

export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Партнёры и бренды</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-text">Партнёры и бренды</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="rounded-card border border-gray-200 bg-surface p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex h-16 items-center">
              <div className="flex h-full w-full items-center justify-center rounded bg-gray-50 text-xl font-bold text-steel">
                {partner.name}
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold text-text">{partner.name}</h2>
            <p className="text-sm text-muted">{partner.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
