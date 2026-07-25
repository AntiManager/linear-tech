'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import FilterPanel from './FilterPanel';
import ProductGrid from './ProductGrid';
import type { Product } from '@/types';

interface CatalogClientProps {
  products: Product[];
  allSeries: string[];
  stockStatuses: string[];
}

export default function CatalogClient({
  products,
  allSeries,
  stockStatuses,
}: CatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedSeries = searchParams.get('series')?.split(',').filter(Boolean) ?? [];
  const selectedStock = searchParams.get('stock')?.split(',').filter(Boolean) ?? [];

  const updateParams = useCallback(
    (key: string, values: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      if (values.length > 0) {
        next.set(key, values.join(','));
      } else {
        next.delete(key);
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const filtered = useMemo(() => {
    if (selectedSeries.length === 0 && selectedStock.length === 0) {
      return products;
    }
    return products.filter((p) => {
      if (selectedSeries.length > 0 && !selectedSeries.includes(p.series)) return false;
      if (selectedStock.length > 0 && !selectedStock.includes(p.stock_status)) return false;
      return true;
    });
  }, [products, selectedSeries, selectedStock]);

  const hasActiveFilters = selectedSeries.length > 0 || selectedStock.length > 0;

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="w-full shrink-0 lg:w-64">
        <FilterPanel
          series={allSeries}
          selectedSeries={selectedSeries}
          onSeriesChange={(v) => updateParams('series', v)}
          stockStatus={stockStatuses}
          selectedStock={selectedStock}
          onStockChange={(v) => updateParams('stock', v)}
          onReset={() => router.push(pathname, { scroll: false })}
        />
      </div>

      <div className="flex-1">
        {hasActiveFilters && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted">
            <span>
              Найдено: {filtered.length} из {products.length}
            </span>
            <button
              onClick={() => router.push(pathname, { scroll: false })}
              className="text-accent hover:underline"
            >
              Сбросить
            </button>
          </div>
        )}
        <ProductGrid
          products={filtered}
          emptyMessage={
            hasActiveFilters
              ? 'Нет товаров с выбранными фильтрами. Попробуйте сбросить фильтры.'
              : 'Товары не найдены'
          }
        />
      </div>
    </div>
  );
}
