import { PriorityBadge } from '@/components';
import { Deal } from '@/types';

export function DealCardOverlay({
  deal,
  isOverlay,
}: {
  deal: Deal;
  isOverlay?: boolean;
}) {
  return (
    <div
      className={`
        cursor-grab rounded-md border border-neutral-200 bg-white p-3
        transition-all duration-200
        ${isOverlay ? 'opacity-50' : ''}
      `}
    >
      <h4 className="mb-1 font-medium text-neutral-900">{deal.name}</h4>
      <p className="mb-2 text-sm text-neutral-600">
        {deal.organization}, {deal.contactPerson}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          {deal.currency}
          {deal.value.toLocaleString()}
        </p>
        <PriorityBadge priority={deal.priority} />
      </div>
    </div>
  );
}
