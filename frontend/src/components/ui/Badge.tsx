import { cn } from '@/lib/utils';

type BadgeVariant = 'in_stock' | 'on_order' | 'out_of_stock';

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  in_stock: 'bg-green-100 text-green-800',
  on_order: 'bg-amber-100 text-amber-800',
  out_of_stock: 'bg-red-100 text-red-800',
};

const labels: Record<BadgeVariant, string> = {
  in_stock: 'В наличии',
  on_order: 'Под заказ',
  out_of_stock: 'Нет на складе',
};

export default function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}
