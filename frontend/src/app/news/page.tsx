import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchArticles } from '@/lib/strapi';
import type { Article } from '@/types';

export const metadata: Metadata = {
  title: 'Новости и статьи',
  description: 'Новости компании Линейные системы, технические статьи, обзоры оборудования HIWIN и Rosca.',
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const perPage = 9;

  let articles: Article[] = [];
  try {
    articles = await fetchArticles();
  } catch {}

  const totalPages = Math.ceil(articles.length / perPage);
  const paged = articles.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <span className="text-text">Новости и статьи</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-text">Новости и статьи</h1>

      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-lg font-medium text-text">Новостей пока нет</p>
          <p className="mt-1 text-sm text-muted">Скоро здесь появятся свежие статьи и новости.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paged.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group rounded-card border border-gray-200 bg-surface overflow-hidden transition-shadow hover:shadow-md"
              >
                {article.cover && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={article.cover.url}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <time className="text-xs text-muted">
                      {new Date(article.published_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    {article.type && (
                      <span className="rounded bg-steel/10 px-2 py-0.5 text-xs font-medium text-steel">
                        {article.type === 'tech_guide' ? 'Техническая статья'
                          : article.type === 'comparison' ? 'Сравнение'
                          : article.type === 'case_study' ? 'Кейс'
                          : 'Новость'}
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold text-text group-hover:text-accent line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/news?page=${page - 1}`}
                  className="rounded-btn border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-gray-50"
                >
                  Назад
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/news?page=${p}`}
                  className={`rounded-btn px-4 py-2 text-sm font-medium ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'border border-gray-200 bg-surface text-text hover:bg-gray-50'
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/news?page=${page + 1}`}
                  className="rounded-btn border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-gray-50"
                >
                  Вперёд
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
