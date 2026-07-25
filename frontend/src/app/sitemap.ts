import type { MetadataRoute } from 'next';

const BASE = 'https://linear-tech.ru';

const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/catalog', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/contacts', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/production', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/production/screws', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/production/nuts', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/news', priority: 0.6, changeFrequency: 'daily' as const },
  { url: '/partners', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/rfq', priority: 0.5, changeFrequency: 'monthly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticPages.map((page) => ({
    url: `${BASE}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return entries;
}
