import { Suspense } from 'react';

import { LayoutListIcon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { CRMPageShell } from '@/components/CRMPageShell';
import { ModalButton } from '@/components/ModalButton';
import { TableLoadingPlaceholder } from '@/components/table/TableLoadingPlaceholder';
import { Button } from '@/components/ui/button';
import { createActivity } from '@/features/activity/activity.actions';
import { ActivitiesTableWrapper } from '@/features/activity/components/ActivitiesTableWrapper';
import { ActivityModal } from '@/features/activity/components/ActivityModal';

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <CRMPageShell
      title="Activities"
      subtitle="Log, track, and manage recent tasks, calls, and follow-ups."
      icon={LayoutListIcon}
      actionButton={
        <ModalButton
          modalComponent={ActivityModal}
          modalProps={{ onSubmitSuccess: createActivity }}
          asChild
        >
          <Button size="sm" className="gap-2 font-medium shadow-sm">
            <PlusIcon className="size-4" />
            New Activity
          </Button>
        </ModalButton>
      }
    >
      <Suspense fallback={<TableLoadingPlaceholder />}>
        <ActivitiesTableWrapper />
      </Suspense>
    </CRMPageShell>
  );
}
