import { PriorityBadge } from '@/components/PriorityBadge';
import { Deal } from '@/types';

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <div
      className="
        rounded-md border p-3
        hover:bg-background/10
      "
    >
      <h4 className="mb-1 font-medium">{deal.name}</h4>
      <p className="text-sm text-secondary">{deal.contactPerson}</p>
      <p className="text-sm text-secondary">
        {deal.value} {deal.currency}
      </p>
      <PriorityBadge priority={deal.priority} />
    </div>
  );
}
