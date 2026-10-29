'use client';

import type { ReactNode } from 'react';

import clsx from 'clsx';

import {
  PriorityLevel,
  type PriorityMetadata,
} from '@/features/priority-level/priority-level';
import { PriorityLevel as PrismaPriorityLevel } from '@/generated/prisma/enums';

interface PriorityBadgeProps {
  priorityLevel: PriorityMetadata | PrismaPriorityLevel;
  children?: ReactNode;
}

export function PriorityBadge({ priorityLevel, children }: PriorityBadgeProps) {
  let priorityLevelInstance: PriorityMetadata;

  if (typeof priorityLevel === 'string') {
    priorityLevelInstance = PriorityLevel.fromValue(priorityLevel);
  } else {
    priorityLevelInstance = priorityLevel;
  }

  return (
    <span
      className={clsx(
        'rounded-sm px-2 py-0.5 text-xs font-medium',
        priorityLevelInstance.className
      )}
    >
      {children ?? priorityLevelInstance.label}
    </span>
  );
}
