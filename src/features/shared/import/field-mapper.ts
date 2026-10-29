import { z } from 'zod';

/**
 * Field mapping configuration for transforming Pipedrive CSV columns to internal schema
 */

export interface FieldMapping<T> {
  /** Pipedrive CSV column name */
  source: string;
  /** Internal field path (supports nested like 'emails.0.value') */
  target: string;
  /** Optional transform function */
  transform?: (value: string, row: Record<string, string>) => unknown;
  /** Whether this field is required */
  required?: boolean;
  /** Default value if missing */
  defaultValue?: unknown;
}

export interface MappingConfig<T> {
  /** Unique identifier for this mapping */
  id: string;
  /** Human-readable name */
  name: string;
  /** Field mappings */
  fields: FieldMapping<T>[];
  /** Entity type this mapping applies to */
  entityType: 'Person' | 'Organization' | 'Deal' | 'Activity';
}

/**
 * Apply field mappings to a CSV row
 */
export function applyFieldMappings<T extends Record<string, unknown>>(
  row: Record<string, string>,
  mappings: FieldMapping<T>[]
): Partial<T> {
  const result: Partial<T> = {};

  for (const mapping of mappings) {
    const sourceValue = row[mapping.source];

    if (sourceValue === undefined || sourceValue === '') {
      if (mapping.required) {
        throw new Error(`Required field '${mapping.source}' is missing`);
      }
      if (mapping.defaultValue !== undefined) {
        setNestedValue(result, mapping.target, mapping.defaultValue);
      }
      continue;
    }

    let transformedValue: unknown = sourceValue;
    if (mapping.transform) {
      transformedValue = mapping.transform(sourceValue, row);
    }

    setNestedValue(result, mapping.target, transformedValue);
  }

  return result;
}

/**
 * Set a nested value on an object using dot notation (e.g., 'emails.0.value')
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const isArrayIndex = /^\d+$/.test(keys[i + 1]);

    if (!(key in current)) {
      current[key] = isArrayIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  const isArrayIndex = /^\d+$/.test(lastKey);

  if (isArrayIndex) {
    const arr = current[lastKey] as unknown[];
    const index = parseInt(lastKey, 10);
    arr[index] = value;
  } else {
    current[lastKey] = value;
  }
}

/**
 * Create a mapping config with sensible defaults for Pipedrive
 */
export function createPipedriveMapping<T>(
  entityType: 'Person' | 'Organization' | 'Deal' | 'Activity',
  customFields: FieldMapping<T>[] = []
): MappingConfig<T> {
  const baseMappings = getBaseMappings(entityType);
  return {
    id: `pipedrive-${entityType.toLowerCase()}`,
    name: `Pipedrive ${entityType} Import`,
    entityType,
    fields: [...baseMappings, ...customFields] as FieldMapping<T>[],
  };
}

/**
 * Base field mappings for each Pipedrive entity type
 */
function getBaseMappings(
  entityType: string
): FieldMapping<Record<string, unknown>>[] {
  switch (entityType) {
    case 'Person':
      return [
        { source: 'ID', target: 'externalId', required: true },
        { source: 'Name', target: 'name', required: true },
        {
          source: 'Email',
          target: 'emails.0.value',
          transform: (v) => v?.trim(),
        },
        {
          source: 'Email Type',
          target: 'emails.0.category',
          defaultValue: 'WORK',
          transform: mapContactCategory,
        },
        {
          source: 'Phone',
          target: 'phones.0.value',
          transform: (v) => v?.trim(),
        },
        {
          source: 'Phone Type',
          target: 'phones.0.category',
          defaultValue: 'WORK',
          transform: mapContactCategory,
        },
        { source: 'Organization ID', target: 'organizationExternalId' },
        { source: 'Owner ID', target: 'ownerExternalId' },
      ];

    case 'Organization':
      return [
        { source: 'ID', target: 'externalId', required: true },
        { source: 'Name', target: 'name', required: true },
        { source: 'Owner ID', target: 'ownerExternalId' },
      ];

    case 'Deal':
      return [
        { source: 'ID', target: 'externalId', required: true },
        { source: 'Title', target: 'title', required: true },
        {
          source: 'Value',
          target: 'value',
          transform: (v) => parseFloat(v || '0'),
        },
        { source: 'Currency', target: 'currency', defaultValue: 'NZD' },
        { source: 'Stage', target: 'stage', transform: mapPipelineStage },
        { source: 'Status', target: 'status', transform: mapDealStatus },
        {
          source: 'Expected Close Date',
          target: 'expectedCloseDate',
          transform: parseDate,
        },
        { source: 'Person ID', target: 'personExternalId' },
        { source: 'Organization ID', target: 'organizationExternalId' },
        { source: 'Owner ID', target: 'ownerExternalId' },
      ];

    case 'Activity':
      return [
        { source: 'ID', target: 'externalId', required: true },
        { source: 'Subject', target: 'subject', required: true },
        { source: 'Type', target: 'type', transform: mapActivityType },
        { source: 'Due Date', target: 'startDate', transform: parseDate },
        { source: 'Due Date', target: 'endDate', transform: parseDate },
        {
          source: 'Done',
          target: 'isDone',
          transform: (v) => v === '1' || v?.toLowerCase() === 'true',
        },
        { source: 'Deal ID', target: 'dealExternalId' },
        { source: 'Person ID', target: 'personExternalId' },
        { source: 'Organization ID', target: 'organizationExternalId' },
        { source: 'Owner ID', target: 'ownerExternalId' },
      ];

    default:
      return [];
  }
}

/**
 * Transform helpers
 */
function mapContactCategory(value: string): 'WORK' | 'PERSONAL' | 'OTHER' {
  const normalized = value?.toUpperCase().trim();
  if (normalized === 'PERSONAL') return 'PERSONAL';
  if (normalized === 'OTHER') return 'OTHER';
  return 'WORK';
}

function mapPipelineStage(value: string): string {
  const stageMap: Record<string, string> = {
    Qualified: 'QUALIFIED',
    'Contact Made': 'CONTACT_MADE',
    'Demo Scheduled': 'DEMO_SCHEDULED',
    'Proposal Made': 'PROPOSAL_MADE',
    'Negotiations Started': 'NEGOTIATIONS_STARTED',
    Won: 'WON',
  };
  return stageMap[value?.trim()] || 'QUALIFIED';
}

function mapDealStatus(value: string): string {
  const statusMap: Record<string, string> = {
    Open: 'OPEN',
    Won: 'WON',
    Lost: 'LOST',
  };
  return statusMap[value?.trim()] || 'OPEN';
}

function mapActivityType(value: string): string {
  const typeMap: Record<string, string> = {
    Call: 'CALL',
    Meeting: 'MEETING',
    Task: 'TASK',
    Deadline: 'DEADLINE',
    Email: 'EMAIL',
    Lunch: 'LUNCH',
  };
  return typeMap[value?.trim()] || 'TASK';
}

function parseDate(value: string): Date | null {
  if (!value || value.trim() === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validate a row against a mapping config
 */
export function validateRow(
  row: Record<string, string>,
  mappings: FieldMapping<Record<string, unknown>>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const mapping of mappings) {
    const value = row[mapping.source];

    if (mapping.required && (value === undefined || value === '')) {
      errors.push(`Required field '${mapping.source}' is missing`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get all unique source columns from mappings (for CSV header validation)
 */
export function getSourceColumns(
  mappings: FieldMapping<Record<string, unknown>>[]
): string[] {
  return [...new Set(mappings.map((m) => m.source))];
}
