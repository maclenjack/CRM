import { DefaultEnum } from '@/models';
import { Deal } from '@/types';

export class PipelineStage extends DefaultEnum {
  public static readonly QUALIFIED = new PipelineStage('QUALIFIED', []);
  public static readonly CONTACT_MADE = new PipelineStage('CONTACT_MADE', []);
  public static readonly DEMO_SCHEDULED = new PipelineStage(
    'DEMO_SCHEDULED',
    []
  );
  public static readonly PROPOSAL_MADE = new PipelineStage('PROPOSAL_MADE', []);
  public static readonly NEGOTIATIONS_STARTED = new PipelineStage(
    'NEGOTIATIONS_STARTED',
    []
  );
  public static readonly WON = new PipelineStage('WON', []);

  private constructor(
    public readonly id: string,
    public deals: Deal[]
  ) {
    super(id);
  }

  public static override values(): PipelineStage[] {
    return [
      this.QUALIFIED,
      this.CONTACT_MADE,
      this.DEMO_SCHEDULED,
      this.PROPOSAL_MADE,
      this.NEGOTIATIONS_STARTED,
      this.WON,
    ];
  }

  public addDeals(deals: Deal[]): void {
    this.deals.push(...deals);
  }

  public static getDealsByStage(stageId: string): Deal[] {
    const stage = this.values().find((s) => s.id === stageId);
    return stage ? stage.deals : [];
  }

  public static getStageByDeal(dealId: string): string | undefined {
    for (const stage of this.values()) {
      if (stage.deals.some((deal) => deal.id === dealId)) {
        return stage.id;
      }
    }
    return undefined;
  }
}
