'use client';

import {
  AlertTriangle,
  ClipboardList,
  Mail,
  Phone,
  Users,
  Utensils,
} from 'lucide-react';

import { getActivityBadgeStyles } from '@/features/activity/utils/styles';
import { cn } from '@/features/shared/utils/cn';
import { ActivityType } from '@/generated/prisma/enums';

interface ActivityTypeBadgeProps {
  type: ActivityType;
  className?: string;
}

const ICON_MAP: Record<
  ActivityType,
  React.ComponentType<{ className?: string }>
> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: ClipboardList,
  DEADLINE: AlertTriangle,
  LUNCH: Utensils,
};

export function ActivityTypeBadge({ type, className }: ActivityTypeBadgeProps) {
  const Icon = ICON_MAP[type] ?? ClipboardList;
  const baseStyles = getActivityBadgeStyles(type);

  return (
    <span
      className={cn(
        `
          inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs
          font-medium
        `,
        baseStyles,
        className
      )}
    >
      <Icon className="size-3" />
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </span>
  );
}
