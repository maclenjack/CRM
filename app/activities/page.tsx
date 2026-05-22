'use client';
import { useState } from 'react';

import { ActivityTable } from '@/components/ActivityTable';
import { Button } from '@/components/Button';
import { ScheduleActivityModal } from '@/components/ScheduleActivityModal';
import { Sidebar } from '@/components/Sidebar';

export default function ActivitiesPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Activities</h1>
          <Button onClick={() => setModalOpen(true)}>+ New Activity</Button>
        </div>
        <ActivityTable />
        <ScheduleActivityModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}
