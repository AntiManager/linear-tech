import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="mx-auto max-w-lg px-4 text-center">
        <h1 className="mb-2 text-7xl font-bold text-primary">404</h1>
        <p className="mb-8 text-xl text-text">Страница не найдена</p>
        <p className="mb-8 text-muted">
          Возможно, страница была удалена или адрес указан неверно.
        </p>

        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-btn bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent/90"
          >
            На главную
          </Link>
          <Link
            href="/catalog"
            className="rounded-btn border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Каталог
          </Link>
          <Link
            href="/contacts"
            className="rounded-btn border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Контакты
          </Link>
        </div>

        <div className="rounded-card border border-gray-200 bg-surface p-6">
          <p className="mb-2 text-sm font-medium text-text">Не можете найти нужный товар?</p>
          <a
            href="tel:+73433821172"
            className="text-lg font-bold text-accent hover:underline"
          >
            +7 (343) 382-11-72
          </a>
          <p className="mt-1 text-sm text-muted">
            Мы поможем подобрать аналог или изготовим на заказ
          </p>
        </div>
      </div>
    </div>
  );
}
