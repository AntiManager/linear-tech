import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCategories, fetchProducts } from '@/lib/strapi';
import type { Category, Product } from '@/types';
import ProductGrid from '@/components/catalog/ProductGrid';

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
          <p className="mt-2 text-muted">{cat.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <FilterPanel
            series={allSeries}
            selectedSeries={[]}
            onSeriesChange={() => {}}
            stockStatus={stockStatuses}
            selectedStock={[]}
            onStockChange={() => {}}
            onReset={() => {}}
          />
        </aside>

        <div className="flex-1">
          {error ? (
            <div className="rounded-card border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-800">Не удалось загрузить товары. Попробуйте позже.</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  series, selectedSeries, onSeriesChange,
  stockStatus, selectedStock, onStockChange, onReset,
}: {
  series: string[];
  selectedSeries: string[];
  onSeriesChange: (s: string[]) => void;
  stockStatus: string[];
  selectedStock: string[];
  onStockChange: (s: string[]) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-card border border-gray-200 bg-surface p-4">
      <h2 className="mb-4 text-lg font-bold text-text">Фильтры</h2>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text">Серия</h3>
          <div className="space-y-1">
            {series.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-accent"
                  checked={selectedSeries.includes(s)}
                  onChange={() => {
                    const next = selectedSeries.includes(s)
                      ? selectedSeries.filter((x) => x !== s)
                      : [...selectedSeries, s];
                    onSeriesChange(next);
                  }}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text">Наличие</h3>
          <div className="space-y-1">
            {stockStatus.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-accent"
                  checked={selectedStock.includes(s)}
                  onChange={() => {
                    const next = selectedStock.includes(s)
                      ? selectedStock.filter((x) => x !== s)
                      : [...selectedStock, s];
                    onStockChange(next);
                  }}
                />
                {s === 'in_stock' ? 'В наличии' : s === 'on_order' ? 'Под заказ' : 'Нет на складе'}
              </label>
            ))}
          </div>
        </div>
      </div>
      {(selectedSeries.length > 0 || selectedStock.length > 0) && (
        <button onClick={onReset} className="mt-4 text-sm text-accent hover:underline">
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
