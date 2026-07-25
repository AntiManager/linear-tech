export interface Product {
  id: number;
  name: string;
  slug: string;
  article: string;
  series: string;
  brand: 'hiwin' | 'rosca' | 'delta' | 'estun' | 'item' | 'other';
  category: Category;
  description: string;
  short_desc: string;
  specs: Record<string, string | number>;
  image: Media | null;
  pdf_catalog: Media | null;
  price: number | null;
  price_opt: number | null;
  stock_status: 'in_stock' | 'on_order' | 'out_of_stock';
  stock_qty: number;
  delivery_days: number;
  is_featured: boolean;
  analogues: Product[];
  seo?: SEO;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: Category | null;
  children: Category[];
  image: Media | null;
  products: Product[];
  order: number;
  is_rosca: boolean;
  seo?: SEO;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover: Media | null;
  type: 'news' | 'tech_guide' | 'comparison' | 'case_study';
  related_products: Product[];
  published_at: string;
}

export interface Order {
  id: number;
  company: string;
  inn: string;
  contact_name: string;
  phone: string;
  email: string;
  items: OrderItem[];
  comment: string;
  status: 'new' | 'processing' | 'sent' | 'closed';
  bitrix_lead_id: number;
  source: string;
}

export interface OrderItem {
  productId: number;
  qty: number;
  price: number;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: Category;
  order: number;
}

export interface Media {
  id: number;
  url: string;
  name: string;
  alternativeText: string;
  width: number;
  height: number;
  formats: Record<string, { url: string; width: number; height: number }>;
}

export interface SEO {
  title: string;
  description: string;
  keywords: string;
}
