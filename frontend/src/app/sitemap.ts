import type { MetadataRoute } from 'next';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const BASE_URL = 'https://linear-tech.ru';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [] as T;
  const json = await res.json();
  return json.data;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contacts`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/news`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/partners`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/production`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/production/screws`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/production/nuts`, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const [categories, products, articles] = await Promise.all([
    fetchAPI<{ slug: string; updatedAt?: string }[]>('/categories?fields[0]=slug&fields[1]=updatedAt'),
    fetchAPI<{ slug: string; category?: { slug: string }; updatedAt?: string }[]>('/products?fields[0]=slug&fields[1]=updatedAt&populate[category][fields][0]=slug'),
    fetchAPI<{ slug: string; updatedAt?: string }[]>('/articles?fields[0]=slug&fields[1]=updatedAt'),
  ]);

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${BASE_URL}/catalog/${cat.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : undefined,
  }));

  const productPages: MetadataRoute.Sitemap = (products || []).map((prod) => ({
    url: `${BASE_URL}/catalog/${prod.category?.slug || 'uncategorized'}/${prod.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
    lastModified: prod.updatedAt ? new Date(prod.updatedAt) : undefined,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : undefined,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...articlePages,
  ];
}
