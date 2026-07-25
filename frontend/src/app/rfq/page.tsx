'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { useRFQBasket } from '@/components/rfq/RFQBasket';
import RFQForm from '@/components/rfq/RFQForm';

export default function RfqPage() {
  const { items, remove } = useRFQBasket();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Запросить КП</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-text">
        Запросить коммерческое предложение
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-xl font-bold text-text">Контактные данные</h2>
            {submitted ? (
              <div className="rounded-md bg-green-50 p-6 text-center">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-green-800">Запрос отправлен</p>
                <p className="mt-1 text-sm text-green-700">
                  Мы свяжемся с вами в ближайшее время.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
                >
                  Вернуться на главную
                </Link>
              </div>
            ) : (
              <RFQForm items={items} onSuccess={() => setSubmitted(true)} />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-lg font-bold text-text">Ваш запрос</h2>
            {items.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-muted">Корзина пуста</p>
                <Link
                  href="/catalog"
                  className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-start justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text">{item.name}</p>
                      <p className="text-xs text-muted">{item.article}</p>
                      <p className="text-xs text-muted">{item.qty} шт.</p>
                    </div>
                    <button
                      onClick={() => remove(item.productId)}
                      className="shrink-0 text-muted hover:text-red-500"
                      aria-label="Удалить"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-card border border-gray-200 bg-surface p-6">
            <h2 className="mb-4 text-lg font-bold text-text">Информация</h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>• КП высылается в PDF на email</li>
              <li>• Срок ответа — до 2 часов в рабочее время</li>
              <li>• Для срочных заказов звоните:</li>
            </ul>
            <a
              href="tel:+73433821172"
              className="mt-2 block text-lg font-bold text-accent hover:underline"
            >
              +7 (343) 382-11-72
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
