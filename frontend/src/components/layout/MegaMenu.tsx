import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CategoryItem {
  name: string;
  slug: string;
}

const columns: CategoryItem[][] = [
  [
    { name: 'Направляющие HIWIN', slug: 'napravlyayushchie-hiwin' },
    { name: 'ШВП HIWIN', slug: 'shvp-hiwin' },
    { name: 'Актуаторы HIWIN', slug: 'aktuatory-hiwin' },
    { name: 'Линейные модули HIWIN', slug: 'lineynye-moduli-hiwin' },
  ],
  [
    { name: 'Сервопривод', slug: 'servoprivod' },
    { name: 'Шаговый привод', slug: 'shagovyy-privod' },
    { name: 'Алюминиевый профиль', slug: 'alyuminievyy-profil' },
    { name: 'Подшипники скольжения', slug: 'podshipniki-skolzheniya' },
  ],
  [
    { name: 'Прецизионные валы', slug: 'pretsizionnye-valy' },
    { name: 'Соединительные муфты', slug: 'soedinitelnye-mufty' },
    { name: 'Виброопоры', slug: 'vibroopory' },
    { name: 'Rosca производство', slug: 'rosca-proizvodstvo' },
  ],
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}
      <div
        className={cn(
          'absolute left-0 top-full z-50 w-screen max-w-3xl rounded-card bg-surface p-6 shadow-xl transition-all',
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
        )}
      >
        <div className="grid grid-cols-3 gap-8">
          {columns.map((col, i) => (
            <div key={i}>
              <ul className="space-y-3">
                {col.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/catalog/${item.slug}`}
                      onClick={onClose}
                      className="text-sm text-text transition-colors hover:text-accent"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
