import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

import { PriorityBadge } from '@/components';
import { Deal } from '@/types';

export function DealCard({ deal }: { deal: Deal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={clsx(
        `
          cursor-grab rounded-md border border-neutral-200 bg-white p-3
          transition-all duration-200
          active:cursor-grabbing
        `,
        {
          'z-100 opacity-50 shadow-lg ring-2 ring-primary-500': isDragging,
          'z-0 opacity-100 hover:bg-neutral-50 hover:shadow-md': !isDragging,
        }
      )}
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
