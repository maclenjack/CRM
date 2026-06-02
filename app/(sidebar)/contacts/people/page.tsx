'use client';
import { useState } from 'react';

import { AddPersonModal } from '@/components/AddPersonModal';
import { Button } from '@/components/Button';
import { PeopleTable } from '@/components/PeopleTable';

export default function PeoplePage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">People</h1>
        <Button onClick={() => setModalOpen(true)}>+ Person</Button>
      </div>
      <PeopleTable />
      <AddPersonModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
