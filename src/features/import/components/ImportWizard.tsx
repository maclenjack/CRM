'use client';

import { useCallback, useRef, useState } from 'react';

import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  type CsvFile,
  ENTITY_ICONS,
  ENTITY_TYPES,
  ENTITY_TYPE_MAP,
  type EntityKey,
} from '../import.types';
import { ImportConfirm } from './ImportConfirm';
import { ImportFileUpload } from './ImportFileUpload';
import { ImportPreview } from './ImportPreview';
import { ImportProgress } from './ImportProgress';

const { CheckCircle } = ENTITY_ICONS;

interface EntityProgress {
  percentage: number;
  total: number;
  completed: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

export function ImportWizard() {
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: execute, 4: progress
  const [files, setFiles] = useState<Record<EntityKey, CsvFile>>({
    organizations: {
      file: null,
      preview: null,
      errors: [],
      validCount: 0,
      invalidCount: 0,
    },
    people: {
      file: null,
      preview: null,
      errors: [],
      validCount: 0,
      invalidCount: 0,
    },
    deals: {
      file: null,
      preview: null,
      errors: [],
      validCount: 0,
      invalidCount: 0,
    },
    activities: {
      file: null,
      preview: null,
      errors: [],
      validCount: 0,
      invalidCount: 0,
    },
  });
  const [validating, setValidating] = useState<EntityKey | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    phase: string;
    percentage: number;
    totalRecords: number;
    completedRecords: number;
    failedRecords: number;
  } | null>(null);
  const [importCounts, setImportCounts] = useState<{
    CREATED: number;
    UPDATED: number;
    SKIPPED: number;
    FAILED: number;
  } | null>(null);
  const [entityProgress, setEntityProgress] = useState<Record<
    string,
    EntityProgress
  > | null>(null);
  const [entityCounts, setEntityCounts] = useState<Record<
    string,
    { CREATED: number; UPDATED: number; SKIPPED: number; FAILED: number }
  > | null>(null);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef(false);

  const handleFileChange = useCallback(
    (entityKey: EntityKey, file: File | null) => {
      setFiles((prev) => ({
        ...prev,
        [entityKey]: {
          ...prev[entityKey],
          file,
          preview: null,
          errors: [],
          validCount: 0,
          invalidCount: 0,
        },
      }));
    },
    []
  );

  const validateFile = async (entityKey: EntityKey) => {
    const file = files[entityKey].file;
    if (!file) return;

    setValidating(entityKey);
    try {
      const formData = new FormData();
      formData.append('entityType', entityKey);
      formData.append('file', file);

      const response = await fetch('/api/import/validate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setFiles((prev) => ({
        ...prev,
        [entityKey]: {
          ...prev[entityKey],
          preview: data.preview,
          errors: data.errors,
          validCount: data.validCount,
          invalidCount: data.invalidCount,
        },
      }));
    } catch (error) {
      toast.error(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setValidating(null);
    }
  };

  const validateAllFiles = async () => {
    const filesToValidate = Object.entries(files).filter(([, v]) => v.file) as [
      EntityKey,
      CsvFile,
    ][];
    console.log(
      '[ImportWizard] Starting validation for:',
      filesToValidate.map(([k]) => k)
    );
    await Promise.all(filesToValidate.map(([key]) => validateFile(key)));
    console.log('[ImportWizard] Validation complete, advancing to step 2');
    setStep(2);
  };

  const startImport = async () => {
    const filesToImport = Object.entries(files).filter(([, v]) => v.file) as [
      EntityKey,
      CsvFile,
    ][];
    console.log(
      '[ImportWizard] Starting import for:',
      filesToImport.map(([k]) => k)
    );
    if (filesToImport.length === 0) {
      toast.error('Please select at least one CSV file');
      return;
    }

    try {
      const formData = new FormData();
      filesToImport.forEach(([key, value]) => {
        if (value.file) formData.append(key, value.file);
      });

      console.log(
        '[ImportWizard] Sending import request to /api/import/execute'
      );
      const response = await fetch('/api/import/execute', {
        method: 'POST',
        body: formData,
      });

      console.log('[ImportWizard] Import response status:', response.status);
      const data = await response.json();
      console.log('[ImportWizard] Import response data:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Import failed to start');
      }

      setSessionId(data.sessionId);
      setStep(4);
      startPolling(data.sessionId);
    } catch (error) {
      console.error('[ImportWizard] Import error:', error);
      toast.error(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const startPolling = (id: string) => {
    console.log('[ImportWizard] Starting polling for session:', id);
    setPolling(true);
    pollingRef.current = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/import/status/${id}`);
        console.log('[ImportWizard] Poll response status:', response.status);
        const data = await response.json();
        console.log('[ImportWizard] Poll data:', data);

        if (data.progress) {
          setImportStatus(data.progress);
        }
        if (data.counts) {
          setImportCounts(data.counts);
        }
        if (data.entityProgress) {
          setEntityProgress(data.entityProgress);
        }
        if (data.entityCounts) {
          setEntityCounts(data.entityCounts);
        }

        if (
          data.session.status === 'COMPLETED' ||
          data.session.status === 'FAILED' ||
          data.session.status === 'ROLLED_BACK'
        ) {
          setPolling(false);
          pollingRef.current = false;
          if (data.session.status === 'COMPLETED') {
            toast.success('Import completed successfully!');
          } else {
            toast.error(`Import ${data.session.status.toLowerCase()}`);
          }
        } else if (pollingRef.current) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('[ImportWizard] Polling error:', error);
        if (pollingRef.current) setTimeout(poll, 5000);
      }
    };
    poll();
  };

  const hasFiles = Object.values(files).some((f) => f.file);
  const allValidated = Object.values(files).every(
    (f) => !f.file || f.preview !== null
  );

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Upload Files';
      case 2:
        return 'Preview & Validate';
      case 3:
        return 'Confirm Import';
      case 4:
        return 'Import Progress';
      default:
        return '';
    }
  };

  const handleDone = () => {
    setStep(1);
    setSessionId(null);
    setImportStatus(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {ENTITY_TYPES.map((entity, index) => (
          <div key={entity.key} className="flex items-center">
            <div
              className={`
                flex size-8 items-center justify-center rounded-full text-sm
                font-medium
                ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {step > index + 1 ? (
                <CheckCircle className="size-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < ENTITY_TYPES.length - 1 && (
              <div
                className={`
                  mx-2 h-0.5 w-16
                  ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <ImportFileUpload
              files={files}
              onFileChange={handleFileChange}
              onValidate={validateAllFiles}
              validating={validating}
              hasFiles={hasFiles}
            />
          )}

          {step === 2 && (
            <ImportPreview
              files={files}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
              allValidated={allValidated}
              hasFiles={hasFiles}
            />
          )}

          {step === 3 && (
            <ImportConfirm
              files={files}
              onBack={() => setStep(2)}
              onStartImport={startImport}
              hasFiles={hasFiles}
            />
          )}

          {step === 4 && (
            <ImportProgress
              files={files}
              importStatus={importStatus}
              entityProgress={entityProgress}
              onDone={handleDone}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
