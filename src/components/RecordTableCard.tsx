import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RecordTableCardProps {
  count: number;
  unitName: string;
  children: React.ReactNode;
}

export function RecordTableCard({
  count,
  unitName,
  children,
}: RecordTableCardProps) {
  return (
    <Card
      className="
        overflow-hidden rounded-xl border border-border/80 bg-card py-0
        shadow-xs
      "
    >
      <CardHeader className="border-b border-border/50 bg-muted/30 px-6 py-5">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            All Records
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            Showing <span className="font-medium text-foreground">{count}</span>{' '}
            {unitName}
            {count > 1 || count === 0 ? 's' : ''} mapped to your profile.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
