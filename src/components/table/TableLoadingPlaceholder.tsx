import { Loader2Icon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export function TableLoadingPlaceholder() {
  return (
    <Card
      className="
        overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs
      "
    >
      <CardContent className="flex h-64 items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground/60" />
      </CardContent>
    </Card>
  );
}
