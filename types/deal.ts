import { PipelineStage, PriorityLevel, Visibility } from './enums';

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  contactPerson: string;
  organization: string;
  stage: PipelineStage;
  priority: PriorityLevel;
  label: string;
  expectedCloseDate: string;
  owner: string;
  sourceChannel: string;
  sourceChannelId: string;
  visibleTo: Visibility;
  products?: string[];
}

export interface DealsByStage {
  [PipelineStage.QUALIFIED]?: Deal[];
  [PipelineStage.CONTACT_MADE]?: Deal[];
  [PipelineStage.DEMO_SCHEDULED]?: Deal[];
  [PipelineStage.PROPOSAL_MADE]?: Deal[];
  [PipelineStage.NEGOTIATIONS_STARTED]?: Deal[];
  [PipelineStage.WON]?: Deal[];
}

export type DealsByStageMap = Map<PipelineStage, Deal[]>;

export interface AddDealFormData {
  name: string;
  contactPerson: string;
  organization: string;
  value: number;
  currency: string;
  stage: PipelineStage;
  label: string;
  expectedCloseDate: string;
  owner: string;
  sourceChannel: string;
  sourceChannelId: string;
  visibleTo: Visibility;
  products: string[];
}
