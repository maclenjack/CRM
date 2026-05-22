import { ActivityType, PriorityLevel } from './enums';

export interface Activity {
  id: string;
  subject: string;
  type: ActivityType;
  done: boolean;
  deal: string;
  priority: PriorityLevel;
  contactPerson: string;
  email: string;
  phone: string;
  organization: string;
  dueDate: string;
  description?: string;
  location?: string;
  owner: string;
}

export interface ScheduleActivityFormData {
  subject: string;
  type: ActivityType;
  startDate: string;
  startTime: string;
  endTime: string;
  priority: PriorityLevel;
  description: string;
  location: string;
  linkedDeal: string;
  linkedPeople: string;
  linkedOrganization: string;
}
