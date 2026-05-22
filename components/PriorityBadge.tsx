import { ReactNode } from 'react';

import clsx from 'clsx';

import { PriorityLevel } from '@/types';

export interface PriorityBadgeProps {
  priority: PriorityLevel;
  children?: ReactNode;
}

function getPriorityClass(priority: PriorityLevel): string {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'bg-red-500 text-white';
    case PriorityLevel.MEDIUM:
      return 'bg-yellow-500 text-white';
    case PriorityLevel.LOW:
      return 'bg-blue-500 text-white';
  }
}

export function PriorityBadge({ priority, children }: PriorityBadgeProps) {
  return (
    <span
      className={clsx(
        'rounded-sm px-2 py-0.5 text-xs font-medium',
        getPriorityClass(priority)
      )}
    >
      {children ?? priority}
    </span>
  );
}
