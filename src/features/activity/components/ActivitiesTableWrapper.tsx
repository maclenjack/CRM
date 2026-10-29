import { LayoutListIcon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ModalButton } from '@/components/ModalButton';
import { RecordTableCard } from '@/components/RecordTableCard';
import { Button } from '@/components/ui/button';
import {
  type ActivityTableSelect,
  activityTableSelect,
} from '@/features/activity/activity';
import { createActivity } from '@/features/activity/activity.actions';
import { ActivitiesTable } from '@/features/activity/components/ActivitiesTable';
import { ActivityModal } from '@/features/activity/components/ActivityModal';
import prisma from '@/lib/prisma';

export async function ActivitiesTableWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const activities: ActivityTableSelect[] = await prisma.activity.findMany({
    where: { ownerId: session.user.id },
    select: activityTableSelect,
    orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
  });

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activities found"
        description="Get started by logging your first task, call, or meeting."
        icon={LayoutListIcon}
        action={
          <ModalButton
            modalComponent={ActivityModal}
            modalProps={{ onSubmitSuccess: createActivity }}
            asChild
          >
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-1.5 size-3.5" />
              Add First Activity
            </Button>
          </ModalButton>
        }
      />
    );
  }

  return (
    <RecordTableCard count={activities.length} unitName="activity">
      <ActivitiesTable activities={activities} />
    </RecordTableCard>
  );
}
