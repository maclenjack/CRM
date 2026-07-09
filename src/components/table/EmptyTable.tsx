import { AlertCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyTableProps {
  message?: string;
  onCreate?: () => void;
}

export function EmptyTable({
  message = 'No data available',
  onCreate,
}: EmptyTableProps) {
  return (
    <Card className="p-8 text-center">
      <AlertCircleIcon className="mx-auto size-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">{message}</h3>
      {onCreate && (
        <Button variant="outline" size="sm" className="mt-6" onClick={onCreate}>
          Create new
        </Button>
      )}
    </Card>
  );
}
