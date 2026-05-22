'use client';
import { useState } from 'react';

import { AddPersonModal } from '@/components/AddPersonModal';
import { Button } from '@/components/Button';
import { ContactsSidebar } from '@/components/ContactsSidebar';
import { InfoBanner } from '@/components/InfoBanner';
import { PeopleTable } from '@/components/PeopleTable';

export default function PeoplePage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <ContactsSidebar />
      <main className="flex-1 overflow-auto p-8">
        <InfoBanner>
          This is a mockup of the People page. No data is loaded.
        </InfoBanner>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">People</h1>
          <Button onClick={() => setModalOpen(true)}>+ Person</Button>
        </div>
        <PeopleTable>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th
                  className="
                    px-4 py-2 text-left text-sm font-medium text-secondary
                  "
                >
                  Name
                </th>
                <th
                  className="
                    px-4 py-2 text-left text-sm font-medium text-secondary
                  "
                >
                  Organization
                </th>
                <th
                  className="
                    px-4 py-2 text-left text-sm font-medium text-secondary
                  "
                >
                  Email
                </th>
                <th
                  className="
                    px-4 py-2 text-left text-sm font-medium text-secondary
                  "
                >
                  Phone
                </th>
                <th
                  className="
                    px-4 py-2 text-left text-sm font-medium text-secondary
                  "
                >
                  Closed deals
                </th>
                <th
                  className="
                    px-4 py-2 text-left text-sm font-medium text-secondary
                  "
                >
                  Open deals
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-background/10">
                <td className="px-4 py-2">John Doe</td>
                <td className="px-4 py-2">Acme Corp</td>
                <td className="px-4 py-2">john@example.com</td>
                <td className="px-4 py-2">+1 555 1234</td>
                <td className="px-4 py-2">3</td>
                <td className="px-4 py-2">5</td>
              </tr>
            </tbody>
          </table>
        </PeopleTable>
        <AddPersonModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}
