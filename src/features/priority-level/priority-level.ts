import { PriorityLevel as PrismaPriorityLevel } from '@/generated/prisma/enums';

import { type BaseMeta, createEnumHelpers } from '../shared/utils/enum';

export interface PriorityMetadata extends BaseMeta {
  readonly className: string;
  readonly sortingValue: number;
}

export const PRIORITY_METADATA = {
  [PrismaPriorityLevel.HIGH]: {
    className: 'bg-destructive text-destructive-foreground',
    sortingValue: 2,
  },
  [PrismaPriorityLevel.MEDIUM]: {
    className: 'bg-warning text-warning-foreground',
    sortingValue: 1,
  },
  [PrismaPriorityLevel.LOW]: {
    className: 'bg-info text-info-foreground',
    sortingValue: 0,
  },
} satisfies Record<
  PrismaPriorityLevel,
  Omit<PriorityMetadata, 'label'> & { label?: string }
>;

export const PriorityLevel = {
  ...PrismaPriorityLevel,

  ...createEnumHelpers<PrismaPriorityLevel, PriorityMetadata>(
    PRIORITY_METADATA
  ),

  sort(
    list: PrismaPriorityLevel[],
    direction: 'asc' | 'desc' = 'asc'
  ): PrismaPriorityLevel[] {
    return [...list].sort((a, b) => {
      const weightA = PRIORITY_METADATA[a].sortingValue;
      const weightB = PRIORITY_METADATA[b].sortingValue;
      return direction === 'asc' ? weightA - weightB : weightB - weightA;
    });
  },
};
