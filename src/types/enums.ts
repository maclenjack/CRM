export enum PriorityLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum ActivityType {
  CALL = 'Call',
  MEETING = 'Meeting',
  EMAIL = 'Email',
  TASK = 'Task',
  NOTE = 'Note',
}

export enum Visibility {
  ALL_USERS = 'All users',
  TEAM_ONLY = 'Team only',
  ONLY_OWNER = 'Only owner',
}

export enum DealStatus {
  OPEN = 'Open',
  WON = 'Won',
  LOST = 'Lost',
}

export enum PipelineStage {
  QUALIFIED = 'Qualified',
  CONTACT_MADE = 'Contact Made',
  DEMO_SCHEDULED = 'Demo Scheduled',
  PROPOSAL_MADE = 'Proposal Made',
  NEGOTIATIONS_STARTED = 'Negotiations Started',
  WON = 'Won',
}

export function isValidPipelineStage(value: string): value is PipelineStage {
  return Object.values(PipelineStage).includes(value as PipelineStage);
}
