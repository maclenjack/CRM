'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import {
  type CsvFile,
  ENTITY_ICONS,
  ENTITY_TYPES,
  ENTITY_TYPE_MAP,
  type EntityKey,
} from '../import.types';

const { Loader2 } = ENTITY_ICONS;

interface EntityProgress {
  percentage: number;
  total: number;
  completed: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

interface ImportProgressProps {
  files: Record<EntityKey, CsvFile>;
  importStatus: {
    phase: string;
    percentage: number;
    totalRecords: number;
    completedRecords: number;
    failedRecords: number;
  } | null;
  entityProgress: Record<string, EntityProgress> | null;
  onDone: () => void;
}

export function ImportProgress({
  files,
  importStatus,
  entityProgress,
  onDone,
}: ImportProgressProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Overall Progress</span>
          <span>{importStatus?.percentage || 0}%</span>
        </div>
        <Progress value={importStatus?.percentage || 0} className="h-3" />
      </div>

      <div
        className="
          grid gap-4
          md:grid-cols-2
        "
      >
        {ENTITY_TYPES.map(({ key, label }) => {
          const fileData = files[key];
          if (!fileData.file) return null;

          const entityType = ENTITY_TYPE_MAP[key];
          const entityProg = entityProgress?.[entityType];

          return (
            <div key={key} className="rounded-sm bg-gray-50 p-3">
              <h5 className="mb-2 font-medium">{label}</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valid rows:</span>
                  <span className="font-medium text-green-600">
                    {fileData.validCount}
                  </span>
                </div>
                {entityProg && (
                  <div
                    className="
                      flex justify-between text-xs text-muted-foreground
                    "
                  >
                    <span>Progress:</span>
                    <span>
                      {entityProg.percentage}% ({entityProg.completed}/
                      {entityProg.total || fileData.validCount})
                    </span>
                  </div>
                )}
                {entityProg && (
                  <>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium text-green-600">
                        {entityProg.created}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="font-medium text-blue-600">
                        {entityProg.updated}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skipped:</span>
                      <span className="font-medium text-gray-600">
                        {entityProg.skipped}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">
                        {entityProg.failed}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {importStatus && (
        <div className="rounded-sm border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            Current phase:{' '}
            <span className="font-medium capitalize">
              {importStatus.phase.replace('_', ' ')}
            </span>
            {importStatus.phase !== 'complete' && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                Processing...
              </span>
            )}
          </p>
        </div>
      )}

      {importStatus?.phase === 'complete' && (
        <div className="flex justify-end pt-4">
          <Button onClick={onDone}>Done</Button>
        </div>
      )}
    </div>
  );
}
