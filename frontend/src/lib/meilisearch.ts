import { Meilisearch } from 'meilisearch';

const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILISEARCH_API_KEY || 'devkey';

let client: Meilisearch | null = null;

function getClient(): Meilisearch {
  if (!client) {
    client = new Meilisearch({ host: MEILI_HOST, apiKey: MEILI_KEY });
  }
  return client;
}

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  article: string;
  series: string;
  price: number | null;
  stock_status: string;
  image_url: string | null;
  category_name: string;
  category_slug: string;
}

export async function searchProducts(q: string, limit = 10): Promise<SearchResult[]> {
  try {
    const index = getClient().index('products');
    const result = await index.search(q, { limit, attributesToHighlight: ['name', 'article'] });
    return result.hits as unknown as SearchResult[];
  } catch {
    return [];
  }
}
