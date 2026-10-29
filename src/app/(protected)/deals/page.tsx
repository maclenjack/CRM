import { Suspense } from 'react';

import { KanbanSquareIcon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { CRMPageShell } from '@/components/CRMPageShell';
import { ModalButton } from '@/components/ModalButton';
import { Button } from '@/components/ui/button';
import { DealKanbanWrapper } from '@/features/deal/components/DealKanbanWrapper';
import { DealModal } from '@/features/deal/components/DealModal';
import { createDeal } from '@/features/deal/deal.actions';
import { KanbanLoadingPlaceholder } from '@/features/kanban-board/components/KanbanLoadingPlaceholder';

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <CRMPageShell
      title="Pipeline"
      subtitle="Track active negotiations and sales pipelines."
      icon={KanbanSquareIcon}
      actionButton={
        <ModalButton
          modalComponent={DealModal}
          modalProps={{ onSubmitSuccess: createDeal }}
          asChild
        >
          <Button size="sm" className="gap-2 font-medium shadow-sm">
            <PlusIcon className="size-4" />
            New Deal
          </Button>
        </ModalButton>
      }
    >
      <Suspense fallback={<KanbanLoadingPlaceholder />}>
        <DealKanbanWrapper />
      </Suspense>
    </CRMPageShell>
  );
}
