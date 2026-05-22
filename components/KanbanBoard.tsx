import { DealCard } from '@/components/DealCard';
import { StageIndicator } from '@/components/StageIndicator';
import { Deal, DealsByStage, PipelineStage } from '@/types';

function getDealsByStage(deals: DealsByStage, stage: string): Deal[] {
  switch (stage) {
    case PipelineStage.QUALIFIED:
      return deals[PipelineStage.QUALIFIED] || [];
    case PipelineStage.CONTACT_MADE:
      return deals[PipelineStage.CONTACT_MADE] || [];
    case PipelineStage.DEMO_SCHEDULED:
      return deals[PipelineStage.DEMO_SCHEDULED] || [];
    case PipelineStage.PROPOSAL_MADE:
      return deals[PipelineStage.PROPOSAL_MADE] || [];
    case PipelineStage.NEGOTIATIONS_STARTED:
      return deals[PipelineStage.NEGOTIATIONS_STARTED] || [];
    case PipelineStage.WON:
      return deals[PipelineStage.WON] || [];
    default:
      return [];
  }
}

export function KanbanBoard({ dealsByStage }: { dealsByStage: DealsByStage }) {
  const stages: string[] = Object.values(PipelineStage);
  console.log(stages);
  return (
    <div className="flex space-x-4 overflow-x-auto">
      {stages.map((stage) => (
        <div key={stage} className="min-w-62.5">
          <h3 className="mb-2 font-medium text-primary">{stage}</h3>
          <StageIndicator stage={stage} isActive={true} />
          <div className="mt-2 space-y-2">
            {getDealsByStage(dealsByStage, stage)?.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
