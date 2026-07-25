import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCategories, fetchProducts } from '@/lib/strapi';
import type { Category, Product } from '@/types';
import CatalogClient from '@/components/catalog/CatalogClient';
import { mdToHtml } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {}
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {}
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: 'Категория не найдена' };
  return {
    title: cat.seo?.title || `${cat.name} — купить со склада`,
    description: cat.seo?.description || `${cat.description} — продукция HIWIN и Rosca в Екатеринбурге.`,
  };
}

export const revalidate = 3600;

export default async function CatalogPage({ params }: Props) {
  const { slug } = await params;

  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {}

  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  let products: Product[] = [];
  let error = false;
  try {
    products = await fetchProducts(slug);
  } catch {
    error = true;
  }

  const allSeries = [...new Set(products.map((p) => p.series).filter(Boolean))];
  const stockStatuses = [...new Set(products.map((p) => p.stock_status))];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{cat.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">{cat.name}</h1>
        {cat.description && (
          <div className="mt-2 text-muted" dangerouslySetInnerHTML={{ __html: mdToHtml(cat.description) }} />
        )}
      </div>

      {error ? (
        <div className="rounded-card border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800">Не удалось загрузить товары. Попробуйте позже.</p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full shrink-0 lg:w-64">
              <div className="animate-pulse rounded-card border border-gray-200 bg-surface p-4">
                <div className="mb-4 h-6 w-24 rounded bg-gray-200" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-5 w-3/4 rounded bg-gray-200" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-card border border-gray-200 bg-surface p-4">
                    <div className="mb-3 aspect-square rounded-md bg-gray-200" />
                    <div className="mb-2 h-4 w-20 rounded bg-gray-200" />
                    <div className="mb-1 h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }>
          <CatalogClient
            products={products}
            allSeries={allSeries}
            stockStatuses={stockStatuses}
          />
        </Suspense>
      )}
    </div>
  );
}
