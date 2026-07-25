'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  series: string[];
  selectedSeries: string[];
  onSeriesChange: (series: string[]) => void;
  stockStatus: string[];
  selectedStock: string[];
  onStockChange: (status: string[]) => void;
  onReset: () => void;
}

const stockLabels: Record<string, string> = {
  in_stock: 'В наличии',
  on_order: 'Под заказ',
  out_of_stock: 'Нет на складе',
};

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-text"
        onClick={() => setOpen(!open)}
      >
        {title}
        <svg
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="space-y-2 pt-1">{children}</div>}
    </div>
  );
}

export default function FilterPanel({
  series,
  selectedSeries,
  onSeriesChange,
  stockStatus,
  selectedStock,
  onStockChange,
  onReset,
}: FilterPanelProps) {
  function toggleSeries(s: string) {
    if (selectedSeries.includes(s)) {
      onSeriesChange(selectedSeries.filter((x) => x !== s));
    } else {
      onSeriesChange([...selectedSeries, s]);
    }
  }

  function toggleStock(s: string) {
    if (selectedStock.includes(s)) {
      onStockChange(selectedStock.filter((x) => x !== s));
    } else {
      onStockChange([...selectedStock, s]);
    }
  }

  const hasFilters = selectedSeries.length > 0 || selectedStock.length > 0;

  return (
    <aside className="rounded-card border border-gray-200 bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Фильтры</h2>
        {hasFilters && (
          <button onClick={onReset} className="text-xs text-accent hover:underline">
            Сбросить
          </button>
        )}
      </div>

      <Section title="Серия">
        {series.map((s) => (
          <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={selectedSeries.includes(s)}
              onChange={() => toggleSeries(s)}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            {s}
          </label>
        ))}
      </Section>

      <Section title="Наличие" defaultOpen={false}>
        {stockStatus.map((s) => (
          <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={selectedStock.includes(s)}
              onChange={() => toggleStock(s)}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            {stockLabels[s] || s}
          </label>
        ))}
      </Section>
    </aside>
  );
}
