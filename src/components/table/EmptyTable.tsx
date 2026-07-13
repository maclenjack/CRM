import { HelpCircleIcon, type LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface EmptyTableProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyTable({
  title = 'No records available',
  description = 'There are no items matching this view or filter configuration.',
  icon: Icon = HelpCircleIcon,
  action,
}: EmptyTableProps) {
  return (
    <Card
      className="
        flex w-full flex-col items-center justify-center border border-dashed
        border-border bg-card/30 p-12 text-center shadow-xs backdrop-blur-xs
        md:p-16
      "
    >
      <div
        className="
          mb-4 shrink-0 rounded-full border border-border/40 bg-muted/60 p-4
          text-secondary shadow-2xs
        "
      >
        <Icon className="size-6 stroke-[1.75]" />
      </div>

      <div className="mx-auto flex max-w-sm flex-col items-center space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs/relaxed text-muted-foreground">{description}</p>

        {action && (
          <div className="flex w-full justify-center pt-4">{action}</div>
        )}
      </div>
    </Card>
  );
}
