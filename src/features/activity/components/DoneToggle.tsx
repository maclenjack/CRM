'use client';

import { useOptimistic, useTransition } from 'react';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { updateActivity } from '@/features/activity/activity.actions';

interface DoneToggleProps {
  activityId: string;
  isDone: boolean;
}

export function DoneToggle({ activityId, isDone }: DoneToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    isDone,
    (_, nextState: boolean) => nextState
  );

  const handleToggle = () => {
    const nextState = !optimisticDone;

    startTransition(async () => {
      setOptimisticDone(nextState);

      const result = await updateActivity(activityId, { isDone: nextState });

      if (!result.success) {
        toast.error(result.error || 'Failed to update status');
      }
    });
  };

  const getIcon = () => {
    if (isPending) return <Loader2 className="size-4 animate-spin" />;
    if (optimisticDone) return <CheckCircle2 className="size-5" />;
    return <Circle className="size-5" />;
  };

  const icon = getIcon();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      onClick={handleToggle}
      className={`
        size-8 rounded-full transition-colors
        ${
          optimisticDone
            ? `
              text-green-600
              hover:bg-green-50 hover:text-green-700
              dark:text-green-500
              dark:hover:bg-green-950/30
            `
            : `
              text-muted-foreground
              hover:text-foreground
            `
        }
      `}
      aria-label={
        optimisticDone ? 'Mark activity as incomplete' : 'Mark activity as done'
      }
      title={optimisticDone ? 'Mark as incomplete' : 'Mark as done'}
    >
      {icon}
    </Button>
  );
}
