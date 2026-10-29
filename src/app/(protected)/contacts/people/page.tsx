import { Suspense } from 'react';

import { PlusIcon, UserIcon } from 'lucide-react';

import { CRMPageShell } from '@/components/CRMPageShell';
import { ModalButton } from '@/components/ModalButton';
import { TableLoadingPlaceholder } from '@/components/table/TableLoadingPlaceholder';
import { Button } from '@/components/ui/button';
import { PeopleTableWrapper } from '@/features/person/components/PeopleTableWrapper';
import { PersonModal } from '@/features/person/components/PersonModal';
import { createPerson } from '@/features/person/person.actions';

export default function PeoplePage() {
  return (
    <CRMPageShell
      title="People"
      subtitle="Manage your individual client relationships, tracking personal profiles, notes, and custom interactions."
      icon={UserIcon}
      actionButton={
        <ModalButton
          modalComponent={PersonModal}
          modalProps={{ onSubmitSuccess: createPerson }}
          asChild
        >
          <Button size="sm" className="gap-2 font-medium shadow-sm">
            <PlusIcon className="size-4" />
            New Person
          </Button>
        </ModalButton>
      }
    >
      <Suspense fallback={<TableLoadingPlaceholder />}>
        <PeopleTableWrapper />
      </Suspense>
    </CRMPageShell>
  );
}
