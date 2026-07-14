import { PlusIcon, UserIcon } from 'lucide-react';

import { auth } from '@/auth';
import { ModalButton } from '@/components/ModalButton';
import { RecordTableCard } from '@/components/RecordTableCard';
import { EmptyTable } from '@/components/table/EmptyTable';
import { Button } from '@/components/ui/button';
import { AddPersonModal } from '@/features/person/components/AddPersonModal';
import { createPersonAction } from '@/features/person/person.actions';
import prisma from '@/lib/prisma';

import { personTableSelect } from '../person';
import { PeopleTable } from './PeopleTable';

export async function PeopleTableWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const people = await prisma.person.findMany({
    where: { ownerId: session.user.id },
    select: personTableSelect,
  });

  if (people.length === 0) {
    return (
      <EmptyTable
        title="No people found"
        description="Get started by adding your first individual contact or customer record to track relationships."
        icon={UserIcon}
        action={
          <ModalButton
            modalComponent={AddPersonModal}
            modalProps={{ onSubmitSuccess: createPersonAction }}
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
