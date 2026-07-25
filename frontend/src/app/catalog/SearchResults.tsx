import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { SearchResult } from '@/lib/meilisearch';

interface SearchResultsProps {
  query: string;
  hits: SearchResult[];
}

export default function SearchResults({ query, hits }: SearchResultsProps) {
  return (
    <>
      <h1 className="mb-2 text-3xl font-bold text-text">
        Поиск: {query}
      </h1>
      <p className="mb-8 text-muted">
        Найдено: {hits.length} {hits.length === 1 ? 'товар' : hits.length < 5 ? 'товара' : 'товаров'}
      </p>

      {hits.length === 0 ? (
        <div className="rounded-card border border-gray-200 bg-surface p-12 text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <p className="mb-2 text-lg font-medium text-text">Ничего не найдено</p>
          <p className="mb-6 text-sm text-muted">
            Попробуйте изменить запрос или поискать по артикулу
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Весь каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {hits.map((hit) => (
            <Link
              key={hit.id}
              href={`/catalog/${hit.category_slug}/${hit.slug}`}
              className="flex items-center gap-4 rounded-card border border-gray-200 bg-surface p-4 transition-shadow hover:shadow-md"
            >
              {hit.image_url && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-bg">
                  <img
                    src={hit.image_url}
                    alt={hit.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {hit.series && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-muted">
                      {hit.series}
                    </span>
                  )}
                  {hit.category_name && (
                    <span className="text-xs text-muted">{hit.category_name}</span>
                  )}
                </div>
                <p className="truncate text-sm font-medium text-text">{hit.name}</p>
                <p className="text-xs text-muted">{hit.article}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-text">
                  {formatPrice(hit.price)}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-btn border border-primary px-3 py-1.5 text-xs font-medium text-primary">
                Запросить
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
