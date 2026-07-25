import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCategories } from '@/lib/strapi';
import { searchProducts } from '@/lib/meilisearch';
import type { SearchResult } from '@/lib/meilisearch';
import type { Category } from '@/types';
import SearchResults from './SearchResults';
import CategoryGrid from './CategoryGrid';

export const metadata: Metadata = {
  title: 'Каталог продукции',
  description: 'Полный каталог промышленной механики: HIWIN, Rosca, Delta, Estun. Линейные направляющие, ШВП, актуаторы, сервоприводы.',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const revalidate = 3600;

export default async function CatalogRootPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim();

  let categories: Category[] = [];
  let searchHits: SearchResult[] = [];

  if (query && query.length >= 2) {
    try {
      searchHits = await searchProducts(query, 20);
    } catch {
      /* meilisearch unavailable */
    }
  } else {
    try {
      categories = await fetchCategories();
    } catch {
      /* strapi unavailable */
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{query ? `Поиск: ${query}` : 'Каталог'}</span>
      </nav>

      {query ? (
        <SearchResults query={query} hits={searchHits} />
      ) : (
        <>
          <h1 className="mb-8 text-3xl font-bold text-text">Каталог продукции</h1>
          {categories.length > 0 ? (
            <CategoryGrid categories={categories} />
          ) : (
            <div className="rounded-card border border-gray-200 bg-surface p-8 text-center">
              <p className="text-muted">Категории временно недоступны.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
