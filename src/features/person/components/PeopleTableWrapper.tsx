import { PlusIcon, UserIcon } from 'lucide-react';

import { auth } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ModalButton } from '@/components/ModalButton';
import { RecordTableCard } from '@/components/RecordTableCard';
import { Button } from '@/components/ui/button';
import { PersonModal } from '@/features/person/components/PersonModal';
import {
  type PersonTableSelect,
  personTableSelect,
} from '@/features/person/person';
import { createPerson } from '@/features/person/person.actions';
import prisma from '@/lib/prisma';

import { PeopleTable } from './PeopleTable';

export async function PeopleTableWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const people: PersonTableSelect[] = await prisma.person.findMany({
    where: { ownerId: session.user.id },
    select: personTableSelect,
  });

  if (people.length === 0) {
    return (
      <EmptyState
        title="No people found"
        description="Get started by adding your first individual contact or customer record to track relationships."
        icon={UserIcon}
        action={
          <ModalButton
            modalComponent={PersonModal}
            modalProps={{ onSubmitSuccess: createPerson }}
            asChild
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 text-xs font-medium"
            >
              <PlusIcon className="mr-1.5 size-3.5" />
              Add First Person
            </Button>
          </ModalButton>
        }
      />
    );
  }

  return (
    <RecordTableCard count={people.length} unitName="individual profile">
      <PeopleTable people={people} />
    </RecordTableCard>
  );
}
