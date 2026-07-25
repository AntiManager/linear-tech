import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCategories, fetchProducts, fetchProduct } from '@/lib/strapi';
import { formatPrice, stockStatusLabel } from '@/lib/utils';
import type { Product, Category } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RFQForm from '@/components/rfq/RFQForm';

interface Props {
  params: Promise<{ slug: string; product: string }>;
}

export async function generateStaticParams() {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {}
  const params: { slug: string; product: string }[] = [];
  for (const cat of categories) {
    let products: Product[] = [];
    try {
      products = await fetchProducts(cat.slug);
    } catch {}
    for (const p of products) {
      params.push({ slug: cat.slug, product: p.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: productSlug } = await params;
  let product: Product | null = null;
  try {
    product = await fetchProduct(productSlug);
  } catch {}
  if (!product) return { title: 'Товар не найден' };
  return {
    title: product.seo?.title || `${product.name} (${product.article}) — купить`,
    description: product.seo?.description || product.short_desc || `${product.name} серии ${product.series}. ${product.brand}. В наличии в Екатеринбурге.`,
  };
}

export const revalidate = 3600;

export default async function ProductPage({ params }: Props) {
  const { slug, product: productSlug } = await params;

  let product: Product | null = null;
  try {
    product = await fetchProduct(productSlug);
  } catch {}

  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_desc || product.description,
    sku: product.article,
    brand: {
      '@type': 'Brand',
      name: product.brand.toUpperCase(),
    },
    offers: {
      '@type': 'Offer',
      price: product.price ?? undefined,
      priceCurrency: 'RUB',
      availability: product.stock_status === 'in_stock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      url: `https://linear-tech.ru/catalog/${slug}/${product.slug}`,
    },
  };

  const specEntries = product.specs ? Object.entries(product.specs) : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/" className="hover:text-accent">Главная</Link>
          <span className="mx-2">/</span>
          <Link href={`/catalog/${slug}`} className="hover:text-accent">
            {product.category?.name || slug}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex aspect-square items-center justify-center rounded-card bg-surface border border-gray-200 p-8">
            {product.image ? (
              <img
                src={product.image.url}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <svg className="h-24 w-24 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              {product.series && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted">
                  {product.series}
                </span>
              )}
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted uppercase">
                {product.brand}
              </span>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-text">{product.name}</h1>
            <p className="mb-4 text-sm text-muted">Артикул: {product.article}</p>

            <div className="mb-4">
              <Badge variant={product.stock_status} />
              {product.stock_qty > 0 && (
                <span className="ml-2 text-sm text-muted">
                  {product.stock_qty} шт.
                </span>
              )}
              {product.delivery_days > 0 && (
                <span className="ml-2 text-sm text-muted">
                  Доставка: {product.delivery_days} дн.
                </span>
              )}
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-text">
                {formatPrice(product.price)}
              </span>
              {product.price_opt && (
                <span className="ml-2 text-sm text-muted line-through">
                  {formatPrice(product.price_opt)}
                </span>
              )}
            </div>

            <p className="mb-6 text-text/80">{product.short_desc || product.description}</p>

            <div className="flex flex-wrap gap-3">
              <Link href={`/rfq?product=${product.slug}`}>
                <Button>Запросить КП</Button>
              </Link>
              {product.pdf_catalog && (
                <a href={product.pdf_catalog.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">Скачать PDF</Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-6">
              <span className="border-b-2 border-accent pb-3 text-sm font-semibold text-accent">
                Описание
              </span>
              {specEntries.length > 0 && (
                <span className="pb-3 text-sm font-medium text-muted hover:text-text cursor-pointer">
                  Характеристики
                </span>
              )}
              {product.pdf_catalog && (
                <span className="pb-3 text-sm font-medium text-muted hover:text-text cursor-pointer">
                  PDF
                </span>
              )}
            </nav>
          </div>

          <div className="py-6">
            <div className="prose prose-sm max-w-none text-text/80">
              {product.description || 'Описание отсутствует.'}
            </div>
          </div>

          {specEntries.length > 0 && (
            <div className="py-6">
              <h2 className="mb-4 text-xl font-bold text-text">Характеристики</h2>
              <table className="w-full text-sm">
                <tbody>
                  {specEntries.map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-text w-1/3">{key}</td>
                      <td className="py-2 text-muted">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.pdf_catalog && (
            <div className="py-6">
              <h2 className="mb-4 text-xl font-bold text-text">Каталог и документация</h2>
              <a
                href={product.pdf_catalog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Скачать PDF ({product.pdf_catalog.name})
              </a>
            </div>
          )}
        </div>

        <div className="mt-12 rounded-card border border-gray-200 bg-surface p-6">
          <h2 className="mb-6 text-xl font-bold text-text">Запросить коммерческое предложение</h2>
          <RFQForm />
        </div>
      </div>
    </>
  );
}
