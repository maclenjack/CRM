import { type BaseMeta, createEnumHelpers } from '@/features/shared/utils/enum';
import { PipelineStage as PrismaPipelineStage } from '@/generated/prisma/enums';

export type PipelineStageMetadata = BaseMeta;

export const PIPELINE_STAGE_METADATA = {
  [PrismaPipelineStage.QUALIFIED]: {},
  [PrismaPipelineStage.CONTACT_MADE]: {},
  [PrismaPipelineStage.DEMO_SCHEDULED]: {},
  [PrismaPipelineStage.PROPOSAL_MADE]: {},
  [PrismaPipelineStage.NEGOTIATIONS_STARTED]: {},
  [PrismaPipelineStage.WON]: {},
} satisfies Record<
  PrismaPipelineStage,
  Omit<PipelineStageMetadata, 'label'> & { label?: string }
>;

export const PipelineStage = {
  ...PrismaPipelineStage,

  ...createEnumHelpers<PrismaPipelineStage, PipelineStageMetadata>(
    PIPELINE_STAGE_METADATA
  ),
};
