import { type BaseMeta, createEnumHelpers } from '@/features/shared/utils/enum';
import { PipelineStage as PrismaPipelineStage } from '@/generated/prisma/enums';

export interface PipelineStageMetadata extends BaseMeta {
  readonly sortingValue: number;
}

type SortFnParameter = PipelineStageMetadata & { value: PrismaPipelineStage };

export const PIPELINE_STAGE_METADATA = {
  [PrismaPipelineStage.QUALIFIED]: {
    sortingValue: 0,
  },
  [PrismaPipelineStage.CONTACT_MADE]: {
    sortingValue: 1,
  },
  [PrismaPipelineStage.DEMO_SCHEDULED]: {
    sortingValue: 2,
  },
  [PrismaPipelineStage.PROPOSAL_MADE]: {
    sortingValue: 3,
  },
  [PrismaPipelineStage.NEGOTIATIONS_STARTED]: {
    sortingValue: 4,
  },
  [PrismaPipelineStage.WON]: {
    sortingValue: 5,
  },
} satisfies Record<
  PrismaPipelineStage,
  Omit<PipelineStageMetadata, 'label'> & { label?: string }
>;

export const PipelineStage = {
  ...PrismaPipelineStage,

  ...createEnumHelpers<PrismaPipelineStage, PipelineStageMetadata>(
    PIPELINE_STAGE_METADATA
  ),

  sortfn: (a: SortFnParameter, b: SortFnParameter) => {
    return a.sortingValue - b.sortingValue;
  },
};
