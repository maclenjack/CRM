'use client';
import { useState } from 'react';

import { AddDealModal } from '@/components/AddDealModal';
import { Button } from '@/components/Button';
import { DealsSidebar } from '@/components/DealsSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import {
  DealsByStage,
  PipelineStage,
  PriorityLevel,
  Visibility,
} from '@/types';

const mockDeals: DealsByStage = {
  [PipelineStage.QUALIFIED]: [
    {
      id: '1',
      name: 'Deal 1',
      value: 1000,
      currency: 'USD',
      contactPerson: 'Alice',
      organization: 'Acme',
      stage: PipelineStage.QUALIFIED,
      priority: PriorityLevel.HIGH,
      label: 'Important',
      expectedCloseDate: '2026-06-01',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '123',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
  // Other pipeline stages with mock data
  [PipelineStage.CONTACT_MADE]: [
    {
      id: '2',
      name: 'Deal 2',
      value: 2500,
      currency: 'USD',
      contactPerson: 'Bob',
      organization: 'Beta Corp',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.MEDIUM,
      label: 'Follow‑up',
      expectedCloseDate: '2026-06-15',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '456',
      visibleTo: Visibility.TEAM_ONLY,
    },
  ],
  [PipelineStage.DEMO_SCHEDULED]: [
    {
      id: '3',
      name: 'Deal 3',
      value: 5000,
      currency: 'USD',
      contactPerson: 'Carol',
      organization: 'Gamma Ltd',
      stage: PipelineStage.DEMO_SCHEDULED,
      priority: PriorityLevel.HIGH,
      label: 'Demo',
      expectedCloseDate: '2026-07-01',
      owner: 'You',
      sourceChannel: 'Phone',
      sourceChannelId: '789',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
  [PipelineStage.PROPOSAL_MADE]: [
    {
      id: '4',
      name: 'Deal 4',
      value: 8000,
      currency: 'USD',
      contactPerson: 'Dave',
      organization: 'Delta Inc',
      stage: PipelineStage.PROPOSAL_MADE,
      priority: PriorityLevel.MEDIUM,
      label: 'Proposal',
      expectedCloseDate: '2026-07-15',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '101',
      visibleTo: Visibility.TEAM_ONLY,
    },
  ],
  [PipelineStage.NEGOTIATIONS_STARTED]: [
    {
      id: '5',
      name: 'Deal 5',
      value: 12000,
      currency: 'USD',
      contactPerson: 'Eve',
      organization: 'Epsilon LLC',
      stage: PipelineStage.NEGOTIATIONS_STARTED,
      priority: PriorityLevel.HIGH,
      label: 'Negotiation',
      expectedCloseDate: '2026-08-01',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '202',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
  [PipelineStage.WON]: [
    {
      id: '6',
      name: 'Deal 6',
      value: 15000,
      currency: 'USD',
      contactPerson: 'Frank',
      organization: 'Zeta Co',
      stage: PipelineStage.WON,
      priority: PriorityLevel.LOW,
      label: 'Closed',
      expectedCloseDate: '2026-05-20',
      owner: 'You',
      sourceChannel: 'Phone',
      sourceChannelId: '303',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
};

export default function DealsPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DealsSidebar />
      <main className="flex-1 overflow-auto p-8">
        <Button onClick={() => setModalOpen(true)}>+ Deal</Button>
        <KanbanBoard dealsByStage={mockDeals} />
        <AddDealModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}
