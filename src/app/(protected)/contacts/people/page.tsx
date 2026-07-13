import { PlusIcon, UserIcon } from 'lucide-react';

import { auth } from '@/auth';
import { ModalButton } from '@/components/ModalButton';
import { EmptyTable } from '@/components/table/EmptyTable';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddPersonModal } from '@/features/person/components/AddPersonModal';
import { PeopleTable } from '@/features/person/components/PeopleTable';
import {
  type PersonTableSelect,
  personTableSelect,
} from '@/features/person/person';
import { createPersonAction } from '@/features/person/person.actions';
import prisma from '@/lib/prisma';

export default async function PeoplePage() {
  const session = await auth();
  if (!session?.user) return null;

  const people: PersonTableSelect[] = await prisma.person.findMany({
    where: { ownerId: session.user.id },
    select: personTableSelect,
  });

  return (
    <div
      className="
        mx-auto w-full max-w-7xl space-y-8 p-6
        md:p-10
      "
    >
      <div
        className="
          flex flex-col gap-4 border-b border-muted/60 pb-6
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div>
          <h1
            className="
              flex items-center gap-3 text-3xl font-bold tracking-tight
              text-foreground
            "
          >
            <UserIcon className="size-7 text-secondary" />
            People
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your individual client relationships, tracking personal
            profiles, notes, and custom interactions.
          </p>
        </div>

        <div
          className="
            flex items-center gap-2 self-start
            sm:self-auto
          "
        >
          <ModalButton
            modalComponent={AddPersonModal}
            modalProps={{ onSubmitSuccess: createPersonAction }}
            asChild
          >
            <Button size="sm" className="gap-2 font-medium shadow-sm">
              <PlusIcon className="size-4" />
              New Person
            </Button>
          </ModalButton>
        </div>
      </div>

      {people.length === 0 ? (
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
      ) : (
        <Card
          className="
            overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs
          "
        >
          <CardHeader className="border-b border-border/50 bg-muted/30 px-6 py-5">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                All Records
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {people.length}
                </span>{' '}
                individual profile{people.length > 1 ? 's' : ''} mapped to your
                profile.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PeopleTable people={people} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
