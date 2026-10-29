'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ENTITY_TYPES,
  type EntityKey,
  type CsvFile,
  ENTITY_ICONS,
} from '../import.types';

const { ArrowLeft, ArrowRight, Loader2 } = ENTITY_ICONS;

interface ImportConfirmProps {
  files: Record<EntityKey, CsvFile>;
  onBack: () => void;
  onStartImport: () => void;
  hasFiles: boolean;
}

export function ImportConfirm({
  files,
  onBack,
  onStartImport,
  hasFiles,
}: ImportConfirmProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Confirm the import. This will create/update records in your CRM.
      </p>
      <div className="space-y-2">
        {ENTITY_TYPES.map(({ key, label }) => {
          const fileData = files[key];
          if (!fileData.file) return null;
          return (
            <div
              key={key}
              className="
                flex items-center justify-between rounded-sm bg-gray-50
                p-3
              "
            >
              <span className="font-medium">{label}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">
                  {fileData.validCount} to import
                </span>
                {fileData.invalidCount > 0 && (
                  <span className="text-red-600">
                    {fileData.invalidCount} errors (will be skipped)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button onClick={onStartImport} disabled={!hasFiles}>
          <Loader2 className="mr-2 size-4" />
          Start Import
        </Button>
      </div>
    </div>
  );
}
