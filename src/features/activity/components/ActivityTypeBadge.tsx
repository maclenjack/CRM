'use client';

import { ActivityType } from '@/features/activity/activity-type';
import { getActivityBadgeStyles } from '@/features/activity/utils/styles';
import { cn } from '@/features/shared/utils/cn';
import { ActivityType as PrismaActivityType } from '@/generated/prisma/enums';

interface ActivityTypeBadgeProps {
  type: PrismaActivityType;
  className?: string;
}

export function ActivityTypeBadge({ type, className }: ActivityTypeBadgeProps) {
  const Icon = ActivityType.fromValue(type).icon;
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
