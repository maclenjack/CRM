import { auth } from '@/auth';
import { ModalButton } from '@/components/ModalButton';
import { AddPersonModal } from '@/features/person/components/AddPersonModal';
import { PeopleTable } from '@/features/person/components/PeopleTable';

export default async function PeoplePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">People</h1>
        <ModalButton modalComponent={AddPersonModal}>+ Person</ModalButton>
      </div>
      <PeopleTable />
    </>
  );
}
