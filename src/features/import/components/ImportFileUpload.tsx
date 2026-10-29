'use client';

import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  type CsvFile,
  ENTITY_ICONS,
  ENTITY_TYPES,
  type EntityKey,
} from '../import.types';

const { ArrowRight, FileText, Loader2, Upload, X } = ENTITY_ICONS;

interface ImportFileUploadProps {
  files: Record<EntityKey, CsvFile>;
  onFileChange: (entityKey: EntityKey, file: File | null) => void;
  onValidate: () => void;
  validating: EntityKey | null;
  hasFiles: boolean;
}

export function ImportFileUpload({
  files,
  onFileChange,
  onValidate,
  validating,
  hasFiles,
}: ImportFileUploadProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Upload your Pipedrive CSV export files. You can import one or all entity
        types. Files will be validated in the next step.
      </p>
      <div
        className="
          grid gap-4
          md:grid-cols-2
        "
      >
        {ENTITY_TYPES.map(({ key, label, icon: Icon, description }) => (
          <div
            key={key}
            className={`
              rounded-lg border-2 p-4 transition-colors
              ${
                files[key].file
                  ? 'border-green-500 bg-green-50'
                  : `
                    border-dashed border-gray-300
                    hover:border-blue-500
                  `
              }
            `}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 size-6 text-muted-foreground" />
              <div className="flex-1">
                <h4 className="font-medium">{label}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
                {files[key].file && (
                  <p className="mt-1 text-sm text-green-600">
                    {files[key].file!.name}
                  </p>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                className="sr-only"
                id={`file-${key}`}
                onChange={(e) => onFileChange(key, e.target.files?.[0] || null)}
                disabled={!!files[key].file}
              />
              <label
                htmlFor={`file-${key}`}
                className={`
                  rounded-md px-3 py-1.5 text-sm transition-colors
                  ${
                    files[key].file
                      ? 'cursor-default bg-gray-100 text-gray-600'
                      : `
                        cursor-pointer bg-blue-500 text-white
                        hover:bg-blue-600
                      `
                  }
                `}
              >
                {files[key].file ? 'Selected' : 'Choose File'}
              </label>
            </div>
            {files[key].file && (
              <Button
                variant="ghost"
                size="sm"
                className="
                  mt-2 text-red-600
                  hover:text-red-700
                "
                onClick={() => onFileChange(key, null)}
              >
                <X className="mr-1 size-4" /> Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={onValidate}
          disabled={!hasFiles || validating !== null}
        >
          {validating && <Loader2 className="mr-2 size-4 animate-spin" />}
          <ArrowRight className="ml-2 size-4" />
          Validate & Continue
        </Button>
      </div>
    </div>
  );
}
