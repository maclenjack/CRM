'use client';
import { useState } from 'react';

import { AddDealModal } from '@/components/AddDealModal';
import { Button } from '@/components/Button';
import { KanbanBoard } from '@/components/KanbanBoard';
import { PriorityLevel } from '@/models';
import { Deal, DealsByStage, PipelineStage, Visibility } from '@/types';

const mockDeals: DealsByStage = {
  [PipelineStage.QUALIFIED]: [
    {
      id: '1',
      name: 'Premium Marketing Suite',
      value: 1250,
      currency: 'NZ$',
      contactPerson: 'Marcus Thompson',
      organization: 'Prism Digital',
      stage: PipelineStage.QUALIFIED,
      priority: PriorityLevel.HIGH,
      label: 'Important',
      expectedCloseDate: '2026-06-01',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '123',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '2',
      name: 'Cloud Infrastructure',
      value: 2000,
      currency: 'NZ$',
      contactPerson: 'Elena Rodriguez',
      organization: 'TechVenture Solutions',
      stage: PipelineStage.QUALIFIED,
      priority: PriorityLevel.MEDIUM,
      label: 'Prospect',
      expectedCloseDate: '2026-06-15',
      owner: 'You',
      sourceChannel: 'Referral',
      sourceChannelId: '124',
      visibleTo: Visibility.TEAM_ONLY,
    },
  ],
  [PipelineStage.CONTACT_MADE]: [
    {
      id: '3',
      name: 'Enterprise API Integration',
      value: 3300,
      currency: 'NZ$',
      contactPerson: 'James Patterson',
      organization: 'VectorTech Inc',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.HIGH,
      label: 'Active',
      expectedCloseDate: '2026-06-20',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '456',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '4',
      name: 'Social Media Management',
      value: 1000,
      currency: 'NZ$',
      contactPerson: 'Samuel Chen',
      organization: 'GourmetPlus Retail',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.HIGH,
      label: 'Follow-up',
      expectedCloseDate: '2026-07-01',
      owner: 'You',
      sourceChannel: 'Phone',
      sourceChannelId: '457',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '5',
      name: 'Website Redesign',
      value: 1000,
      currency: 'NZ$',
      contactPerson: 'Victoria Martin',
      organization: 'Nexus Design Group',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.HIGH,
      label: 'Proposal',
      expectedCloseDate: '2026-07-10',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '458',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '6',
      name: 'Technical Support Package',
      value: 360,
      currency: 'NZ$',
      contactPerson: 'Oliver Blake',
      organization: 'Zenith Consultancy',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.MEDIUM,
      label: 'Support',
      expectedCloseDate: '2026-07-15',
      owner: 'You',
      sourceChannel: 'Referral',
      sourceChannelId: '459',
      visibleTo: Visibility.TEAM_ONLY,
    },
    {
      id: '7',
      name: 'Analytics Dashboard',
      value: 360,
      currency: 'NZ$',
      contactPerson: 'Diana Foster',
      organization: 'Apex Analytics Ltd',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.MEDIUM,
      label: 'Tech',
      expectedCloseDate: '2026-07-20',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '460',
      visibleTo: Visibility.TEAM_ONLY,
    },
    {
      id: '8',
      name: 'Automation Framework',
      value: 1000,
      currency: 'NZ$',
      contactPerson: 'Xavier Knight',
      organization: 'Apex Analytics Ltd',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.MEDIUM,
      label: 'Automation',
      expectedCloseDate: '2026-07-25',
      owner: 'You',
      sourceChannel: 'Phone',
      sourceChannelId: '461',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '9',
      name: 'Property Management Suite',
      value: 1400,
      currency: 'NZ$',
      contactPerson: 'Harrison Wells',
      organization: 'PropertyPro Systems',
      stage: PipelineStage.CONTACT_MADE,
      priority: PriorityLevel.MEDIUM,
      label: 'Housing',
      expectedCloseDate: '2026-08-01',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '462',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
  [PipelineStage.DEMO_SCHEDULED]: [
    {
      id: '10',
      name: 'Legal Tech Platform',
      value: 2130,
      currency: 'NZ$',
      contactPerson: 'Nathan Rivers',
      organization: 'Lexicon Digital',
      stage: PipelineStage.DEMO_SCHEDULED,
      priority: PriorityLevel.HIGH,
      label: 'Legal Tech',
      expectedCloseDate: '2026-07-05',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '463',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
  [PipelineStage.PROPOSAL_MADE]: [
    {
      id: '11',
      name: 'Enterprise Solutions Package',
      value: 5500,
      currency: 'NZ$',
      contactPerson: 'Benjamin Howard',
      organization: 'Global Dynamics Inc',
      stage: PipelineStage.PROPOSAL_MADE,
      priority: PriorityLevel.HIGH,
      label: 'Enterprise',
      expectedCloseDate: '2026-08-15',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '464',
      visibleTo: Visibility.TEAM_ONLY,
    },
  ],
  [PipelineStage.NEGOTIATIONS_STARTED]: [
    {
      id: '12',
      name: 'Infrastructure Migration',
      value: 3200,
      currency: 'NZ$',
      contactPerson: 'Rebecca Stone',
      organization: 'CloudForward Industries',
      stage: PipelineStage.NEGOTIATIONS_STARTED,
      priority: PriorityLevel.HIGH,
      label: 'Infrastructure',
      expectedCloseDate: '2026-08-20',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '465',
      visibleTo: Visibility.ALL_USERS,
    },
  ],
  [PipelineStage.WON]: [
    {
      id: '13',
      name: 'AI Implementation Services',
      value: 3960,
      currency: 'NZ$',
      contactPerson: 'Christopher Grant',
      organization: 'Lexicon Digital',
      stage: PipelineStage.WON,
      priority: PriorityLevel.MEDIUM,
      label: 'AI',
      expectedCloseDate: '2026-05-20',
      owner: 'You',
      sourceChannel: 'Phone',
      sourceChannelId: '466',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '14',
      name: 'Dashboard Optimization',
      value: 3120,
      currency: 'NZ$',
      contactPerson: 'Tyler Bennett',
      organization: 'Lexicon Digital',
      stage: PipelineStage.WON,
      priority: PriorityLevel.MEDIUM,
      label: 'Maintenance',
      expectedCloseDate: '2026-05-22',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '467',
      visibleTo: Visibility.TEAM_ONLY,
    },
    {
      id: '15',
      name: 'Web Platform Launch',
      value: 900,
      currency: 'NZ$',
      contactPerson: 'Sophia Turner',
      organization: 'Creative Labs Digital',
      stage: PipelineStage.WON,
      priority: PriorityLevel.MEDIUM,
      label: 'Web',
      expectedCloseDate: '2026-05-18',
      owner: 'You',
      sourceChannel: 'Referral',
      sourceChannelId: '468',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '16',
      name: 'Event Photography Services',
      value: 250,
      currency: 'NZ$',
      contactPerson: 'Lucas Mitchell',
      organization: 'Artisan Events Co',
      stage: PipelineStage.WON,
      priority: PriorityLevel.MEDIUM,
      label: 'Event',
      expectedCloseDate: '2026-05-15',
      owner: 'You',
      sourceChannel: 'LinkedIn',
      sourceChannelId: '469',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '17',
      name: 'E-commerce Platform',
      value: 3000,
      currency: 'NZ$',
      contactPerson: 'Andrew Scott',
      organization: 'RetailHub Solutions',
      stage: PipelineStage.WON,
      priority: PriorityLevel.MEDIUM,
      label: 'Web Dev',
      expectedCloseDate: '2026-05-12',
      owner: 'You',
      sourceChannel: 'Phone',
      sourceChannelId: '470',
      visibleTo: Visibility.ALL_USERS,
    },
    {
      id: '18',
      name: 'Digital Campaign Strategy',
      value: 900,
      currency: 'NZ$',
      contactPerson: 'Rachel Cooper',
      organization: 'RetailHub Solutions',
      stage: PipelineStage.WON,
      priority: PriorityLevel.MEDIUM,
      label: 'Marketing',
      expectedCloseDate: '2026-05-10',
      owner: 'You',
      sourceChannel: 'Email',
      sourceChannelId: '471',
      visibleTo: Visibility.TEAM_ONLY,
    },
  ],
};

export default function DealsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [dealsByStage] = useState<DealsByStage>(mockDeals);

  // Calculate total deal count
  const totalDeals = Object.values(dealsByStage).reduce(
    (sum, dealsInStage) => sum + (dealsInStage?.length || 0),
    0
  );

  const dealsByStageMap = new Map<PipelineStage, Deal[]>([
    [PipelineStage.QUALIFIED, dealsByStage[PipelineStage.QUALIFIED] || []],
    [
      PipelineStage.CONTACT_MADE,
      dealsByStage[PipelineStage.CONTACT_MADE] || [],
    ],
    [
      PipelineStage.DEMO_SCHEDULED,
      dealsByStage[PipelineStage.DEMO_SCHEDULED] || [],
    ],
    [
      PipelineStage.PROPOSAL_MADE,
      dealsByStage[PipelineStage.PROPOSAL_MADE] || [],
    ],
    [
      PipelineStage.NEGOTIATIONS_STARTED,
      dealsByStage[PipelineStage.NEGOTIATIONS_STARTED] || [],
    ],
    [PipelineStage.WON, dealsByStage[PipelineStage.WON] || []],
  ]);

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Pipeline
            </h1>
            <p className="text-sm text-neutral-600">{totalDeals} deals</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>+ Deal</Button>
        </div>
        <KanbanBoard dealsByStage={dealsByStageMap} />
        <AddDealModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}
