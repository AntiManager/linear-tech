export function formatPrice(price: number | null): string {
  if (price === null) return 'По запросу';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

export function stockStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_stock: 'В наличии',
    on_order: 'Под заказ',
    out_of_stock: 'Нет на складе',
  };
  return labels[status] || status;
}

export function stockStatusColor(status: string): string {
  const colors: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-800',
    on_order: 'bg-amber-100 text-amber-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function cn(...classes: (string | false | undefined | null | 0 | '')[]): string {
  return classes.filter(Boolean).join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
