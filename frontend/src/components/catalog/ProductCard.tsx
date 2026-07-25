import Link from 'next/link';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/catalog/${product.category.slug}/${product.slug}`}
      className="group block rounded-card border border-gray-200 bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-bg">
        {product.image ? (
          <img
            src={product.image.url}
            alt={product.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <svg className="h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted">
          {product.series}
        </span>
        <Badge variant={product.stock_status} />
      </div>

      <h3 className="mb-1 text-sm font-medium text-text line-clamp-2 group-hover:text-accent">
        {product.name}
      </h3>

      <p className="mb-3 text-xs text-muted line-clamp-1">{product.article}</p>

      <div className="mb-3">
        <span className="text-lg font-bold text-text">
          {formatPrice(product.price)}
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        Запросить
      </Button>
    </Link>
  );
}
