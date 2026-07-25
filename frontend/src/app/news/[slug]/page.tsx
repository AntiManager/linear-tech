import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchArticles, fetchArticle } from '@/lib/strapi';
import type { Article } from '@/types';
import ProductCard from '@/components/catalog/ProductCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  let articles: Article[] = [];
  try {
    articles = await fetchArticles();
  } catch {}
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let article: Article | null = null;
  try {
    article = await fetchArticle(slug);
  } catch {}
  if (!article) return { title: 'Статья не найдена' };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export const revalidate = 3600;

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article: Article | null = null;
  try {
    article = await fetchArticle(slug);
  } catch {}

  if (!article) notFound();

  const related = article.related_products?.filter(Boolean) || [];

  return (
    <article className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/news" className="hover:text-accent">Новости и статьи</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{article.title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <time className="text-sm text-muted">
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
          <h1 className="text-3xl font-bold text-text">{article.title}</h1>
        </div>

        {article.cover && (
          <div className="mb-8 overflow-hidden rounded-card">
            <img
              src={article.cover.url}
              alt={article.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-gray max-w-none text-text/80 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <div className="mt-8 flex items-center gap-4 border-t border-gray-200 pt-6">
          <span className="text-sm font-medium text-muted">Поделиться:</span>
          <a
            href={`https://t.me/share/url?url=https://linear-tech.ru/news/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <a
            href={`https://wa.me/?text=https://linear-tech.ru/news/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          <a
            href={`https://vk.com/share.php?url=https://linear-tech.ru/news/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.684 0H8.316C3.064 0 0 3.064 0 8.316v7.368C0 20.936 3.064 24 8.316 24h7.368C20.936 24 24 20.936 24 15.684V8.316C24 3.064 20.936 0 15.684 0zm3.528 16.896h-1.344c-.588 0-.768-.432-1.728-1.416-.864-.828-1.236-.936-1.452-.936-.3 0-.384.084-.384.528v1.392c0 .384-.12.6-1.104.6a6.108 6.108 0 01-4.608-2.784A11.292 11.292 0 016 9.552c0-.456.168-.6.528-.6h1.344c.396 0 .54.168.684.588.744 2.04 1.992 3.804 2.508 3.804.192 0 .276-.084.276-.552v-2.148c-.06-.996-.576-1.08-.576-1.44 0-.36.276-.432.528-.432h2.112c.396 0 .528.204.528.648v3.492c0 .396.168.528.276.528.228 0 .408-.132.816-.54.744-.84 1.32-2.028 1.32-2.028.072-.168.18-.288.384-.288h1.344c.4 0 .476.204.384.48-.3.984-1.584 2.748-1.584 2.748-.132.192-.168.276 0 .492.12.168.516.492.792.78.504.54.912.984 1.032 1.32.12.324 0 .492-.384.492z" />
            </svg>
          </a>
        </div>

        <div className="mt-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Назад к новостям
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-text">Сопутствующие товары</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
