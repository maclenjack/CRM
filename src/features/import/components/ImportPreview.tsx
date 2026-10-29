'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ENTITY_TYPES,
  type EntityKey,
  type CsvFile,
  ENTITY_ICONS,
} from '../import.types';

const { ArrowLeft, ArrowRight, FileText } = ENTITY_ICONS;

interface ImportPreviewProps {
  files: Record<EntityKey, CsvFile>;
  onBack: () => void;
  onContinue: () => void;
  allValidated: boolean;
  hasFiles: boolean;
}

export function ImportPreview({
  files,
  onBack,
  onContinue,
  allValidated,
  hasFiles,
}: ImportPreviewProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Review the validation results for each file. Fix any errors
        before proceeding.
      </p>
      <div className="space-y-4">
        {ENTITY_TYPES.map(({ key, label, icon: Icon }) => {
          const fileData = files[key];
          if (!fileData.file) return null;

          return (
            <div key={key} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="size-5" />
                  <h4 className="font-medium">{label}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      fileData.validCount > 0 ? 'default' : 'secondary'
                    }
                  >
                    {fileData.validCount} valid
                  </Badge>
                  <Badge
                    variant={
                      fileData.invalidCount > 0
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {fileData.invalidCount} errors
                  </Badge>
                </div>
              </div>

              {fileData.preview && fileData.preview.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(fileData.preview[0]).map((col) => (
                          <th
                            key={col}
                            className="
                              p-2 text-left font-medium
                              text-muted-foreground
                            "
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.preview
                        .slice(0, 5)
                        .map((row: any, i: number) => (
                          <tr
                            key={i}
                            className="
                              border-b
                              last:border-0
                            "
                          >
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="p-2">
                                {String(val).slice(0, 50)}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {fileData.errors.length > 0 && (
                <div
                  className="
                    mt-3 rounded-sm border border-red-200 bg-red-50 p-3
                  "
                >
                  <h5 className="mb-2 text-sm font-medium text-red-800">
                    Errors:
                  </h5>
                  <ul className="space-y-1 text-sm text-red-700">
                    {fileData.errors
                      .slice(0, 5)
                      .map(({ row, errors }: any, i: number) => (
                        <li key={i}>
                          Row {row?.ID || i + 1}: {errors.join(', ')}
                        </li>
                      ))}
                    {fileData.errors.length > 5 && (
                      <li>
                        ... and {fileData.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!allValidated || !hasFiles}
        >
          <ArrowRight className="ml-2 size-4" />
          Continue to Import
        </Button>
      </div>
    </div>
  );
}
