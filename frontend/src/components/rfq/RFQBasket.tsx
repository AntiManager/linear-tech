'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

interface BasketItem {
  productId: number;
  name: string;
  article: string;
  qty: number;
}

const STORAGE_KEY = 'rfq_basket';

function loadBasket(): BasketItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BasketItem[]) : [];
  } catch {
    return [];
  }
}

function saveBasket(items: BasketItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full */
  }
}

interface RFQBasketProps {
  onOpenForm?: () => void;
}

export default function RFQBasket({ onOpenForm }: RFQBasketProps) {
  const [items, setItems] = useState<BasketItem[]>(() => loadBasket());

  const updateItems = useCallback((next: BasketItem[]) => {
    setItems(next);
    saveBasket(next);
  }, []);

  function remove(id: number) {
    updateItems(items.filter((i) => i.productId !== id));
  }

  function updateQty(id: number, qty: number) {
    if (qty < 1) return;
    updateItems(items.map((i) => (i.productId === id ? { ...i, qty } : i)));
  }

  if (items.length === 0) return null;

  return (
    <>
      {items.length > 0 && (
        <>
          <div className="mb-4 rounded-card border border-gray-200 bg-surface p-4">
            <h3 className="mb-3 text-sm font-bold text-text">Запрос котировки</h3>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{item.name}</p>
                    <p className="text-xs text-muted">{item.article}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                      className="w-14 rounded-input border border-gray-300 px-2 py-1 text-center text-sm"
                    />
                    <button
                      onClick={() => remove(item.productId)}
                      className="text-muted hover:text-red-500"
                      aria-label="Удалить"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
              <span className="font-medium text-text">Итого: {items.reduce((s, i) => s + i.qty, 0)} шт.</span>
              <Button size="sm" onClick={onOpenForm}>
                Оформить
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function RFQBasketBadge() {
  const [count] = useState(() => loadBasket().length);

  if (count === 0) return null;

  return (
    <Link href="/rfq" className="relative inline-flex items-center text-white hover:opacity-80">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
        {count}
      </span>
    </Link>
  );
}

export function useRFQBasket() {
  const [items, setItems] = useState<BasketItem[]>(() => loadBasket());

  const add = useCallback((item: BasketItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const next = existing
        ? prev.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i))
        : [...prev, item];
      saveBasket(next);
      return next;
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveBasket(next);
      return next;
    });
  }, []);

  return { items, add, remove };
}
