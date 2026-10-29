import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function KanbanLoadingPlaceholder() {
  const placeholderColumns = Array.from({ length: 4 });

  return (
    <div
      className="
        flex max-w-full items-start gap-6 overflow-x-auto pb-6 select-none
      "
    >
      {placeholderColumns.map((_, colIndex) => (
        <Card
          key={colIndex}
          className="
            flex min-h-125 w-80 shrink-0 flex-col rounded-xl border
            border-border bg-muted/40 p-2 shadow-none
          "
        >
          <CardHeader
            className="
              flex flex-row items-center justify-between space-y-0 p-3 pb-2
            "
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 bg-muted-foreground/10" />
              <Skeleton className="size-5 rounded-full bg-muted-foreground/10" />
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-3 p-2 pt-0">
            {Array.from({ length: 2 }).map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="w-full border-border/50 bg-card/60 shadow-sm"
              >
                <CardHeader className="space-y-2 p-4 pb-1.5">
                  <Skeleton className="h-4 w-3/4 bg-muted-foreground/10" />
                  <Skeleton className="h-3 w-1/2 bg-muted-foreground/10" />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-4 pt-0">
                  <Skeleton className="h-4 w-16 bg-muted-foreground/10" />
                  <Skeleton className="h-5 w-12 bg-muted-foreground/10" />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
