import { AddPersonModal, ModalButton, PeopleTable } from '@/components';

export default function PeoplePage() {
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
