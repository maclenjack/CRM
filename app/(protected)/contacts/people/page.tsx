import { auth } from '@/auth';
import { AddPersonModal } from '@/components/AddPersonModal';
import { ModalButton } from '@/components/ModalButton';
import { PeopleTable } from '@/components/PeopleTable';

export default async function PeoplePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">People</h1>
        <ModalButton Modal={AddPersonModal}>+ Person</ModalButton>
      </div>
      <PeopleTable />
    </>
  );
}
