import Link from 'next/link';
import type { Category } from '@/types';

const ICONS = [
  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'M12 2l-5 5h3v10H7l5 5 5-5h-3V7h3L12 2z',
  'M9 9l10-5-5 10-5-5zm-4 5l4 4-4 4-4-4 4-4z',
  'M13 10V3L4 14h7v7l9-11h-7z',
  'M12 2a10 10 0 1010 10M12 2v4m0 0a6 6 0 016 6h-4m-2-2l4-4',
  'M4 12a8 8 0 0116 0M4 12a8 8 0 0016 0',
  'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
  'M3 3h18v18H3V3z',
];

function shorten(text: string, maxLen = 80): string {
  const clean = text.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '').trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat, i) => (
        <Link
          key={cat.slug}
          href={`/catalog/${cat.slug}`}
          className="group flex items-start gap-4 rounded-card border border-gray-200 bg-surface p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[i % ICONS.length]} />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-text group-hover:text-accent">{cat.name}</h2>
            {cat.description && (
              <p className="mt-1 text-sm text-muted line-clamp-2">{shorten(cat.description)}</p>
            )}
            {cat.children && cat.children.length > 0 && (
              <p className="mt-1 text-xs text-muted">{cat.children.length} подкатегорий</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
