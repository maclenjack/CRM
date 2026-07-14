import React from 'react';

import { type LucideIcon } from 'lucide-react';

import { cn } from '@/features/shared/utils/cn';

interface CRMPageShellProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actionButton: React.ReactNode;
  children: React.ReactNode;
  iconClassName?: string;
}

export function CRMPageShell({
  title,
  subtitle,
  icon: Icon,
  actionButton,
  children,
  iconClassName,
}: CRMPageShellProps) {
  return (
    <div
      className="
        mx-auto w-full max-w-7xl space-y-8 p-6
        md:p-10
      "
    >
      <div
        className="
          flex flex-col gap-4 border-b border-muted/60 pb-6
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div>
          <h1
            className="
              flex items-center gap-3 text-3xl font-bold tracking-tight
              text-foreground
            "
          >
            <Icon className={cn('size-7', iconClassName || 'text-secondary')} />
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div
          className="
            flex items-center gap-2 self-start
            sm:self-auto
          "
        >
          {actionButton}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
