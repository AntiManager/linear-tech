import type { Product, Category, Article } from '@/types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
    next: {
      revalidate: (options?.next as { revalidate?: number })?.revalidate ?? 3600,
    },
    cache: process.env.NODE_ENV === 'production' ? undefined : 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchProducts(categorySlug: string): Promise<Product[]> {
  return fetchAPI<Product[]>(
    `/products?` +
    new URLSearchParams({
      'filters[category][slug][$eq]': categorySlug,
      populate: 'image,pdf_catalog,category',
      'pagination[limit]': '50',
      sort: 'name:asc',
    })
  );
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const data = await fetchAPI<Product[]>(
    `/products?filters[slug][$eq]=${slug}&populate=*`
  );
  return Array.isArray(data) ? data[0] || null : null;
}

export async function fetchCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/categories?populate=children,image&sort=order:asc', {
    next: { revalidate: 86400 },
  });
}

export async function fetchArticles(): Promise<Article[]> {
  return fetchAPI<Article[]>('/articles?populate=cover,related_products&sort=publishedAt:desc');
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  const data = await fetchAPI<Article[]>(
    `/articles?filters[slug][$eq]=${slug}&populate=cover,related_products`
  );
  return Array.isArray(data) ? data[0] || null : null;
}

export async function createOrder(orderData: {
  company: string;
  contact_name: string;
  phone: string;
  email?: string;
  items: { productId: number; qty: number; price?: number }[];
  comment?: string;
}) {
  const res = await fetch(`${STRAPI_URL}/api/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: orderData }),
  });
  if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
  return res.json();
}
