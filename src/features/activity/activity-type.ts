import {
  AlertTriangle,
  ClipboardList,
  type LucideIcon,
  Mail,
  Phone,
  Users,
  Utensils,
} from 'lucide-react';

import { ActivityType as PrismaActivityType } from '@/generated/prisma/enums';

import { type BaseMeta, createEnumHelpers } from '../shared/utils/enum';

export interface ActivityTypeMetadata extends BaseMeta {
  readonly icon: LucideIcon;
}

export const ACTIVITY_TYPE_METADATA = {
  [PrismaActivityType.CALL]: {
    icon: Phone,
  },
  [PrismaActivityType.EMAIL]: {
    icon: Mail,
  },
  [PrismaActivityType.MEETING]: {
    icon: Users,
  },
  [PrismaActivityType.TASK]: {
    icon: ClipboardList,
  },
  [PrismaActivityType.DEADLINE]: {
    icon: AlertTriangle,
  },
  [PrismaActivityType.LUNCH]: {
    icon: Utensils,
  },
} satisfies Record<
  PrismaActivityType,
  Omit<ActivityTypeMetadata, 'label'> & { label?: string }
>;

export const ActivityType = {
  ...PrismaActivityType,

  ...createEnumHelpers<PrismaActivityType, ActivityTypeMetadata>(
    ACTIVITY_TYPE_METADATA
  ),
};
