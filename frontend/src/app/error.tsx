'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-text">Произошла ошибка</h1>
        <p className="mb-8 text-muted">
          Что-то пошло не так. Пожалуйста, попробуйте обновить страницу или
          свяжитесь с нами по телефону.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={reset}>
            Попробовать снова
          </Button>
          <a
            href="tel:+73433821172"
            className="inline-flex items-center justify-center gap-2 rounded-btn border-2 border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          >
            +7 (343) 382-11-72
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <p className="mt-6 rounded-md bg-red-50 p-4 text-left text-xs text-red-800">
            {error.message}
            {error.digest && <span className="block mt-1">Digest: {error.digest}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
