import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react';

export interface CsvFile {
  file: File | null;
  preview: any;
  errors: any[];
  validCount: number;
  invalidCount: number;
}

export interface ImportSession {
  id: string;
  status: string;
}

export interface EntityTypeConfig {
  key: string;
  label: string;
  icon: typeof FileText;
  description: string;
}

export const ENTITY_TYPES: readonly EntityTypeConfig[] = [
  {
    key: 'organizations',
    label: 'Organizations',
    icon: FileText,
    description: 'Company/organization data',
  },
  {
    key: 'people',
    label: 'People',
    icon: FileText,
    description: 'Contact person data with emails/phones',
  },
  {
    key: 'deals',
    label: 'Deals',
    icon: FileText,
    description: 'Deal/opportunity data',
  },
  {
    key: 'activities',
    label: 'Activities',
    icon: FileText,
    description: 'Tasks, calls, meetings, etc.',
  },
] as const;

export type EntityKey = (typeof ENTITY_TYPES)[number]['key'];

export const ENTITY_TYPE_MAP: Record<EntityKey, string> = {
  organizations: 'ORGANIZATION',
  people: 'PERSON',
  deals: 'DEAL',
  activities: 'ACTIVITY',
};

export const ENTITY_ICONS = {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  X,
} as const;
