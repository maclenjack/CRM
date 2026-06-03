import { ReactNode } from 'react';

import clsx from 'clsx';

import { PriorityLevel } from '@/models';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  children?: ReactNode;
}

export function PriorityBadge({ priority, children }: PriorityBadgeProps) {
  return (
    <span
      className={clsx(
        'rounded-sm px-2 py-0.5 text-xs font-medium',
        priority.className
      )}
    >
      {children ?? priority.toString()}
    </span>
  );
}
