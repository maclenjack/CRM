'use client';

import { useState } from 'react';

import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/features/shared/utils/cn';
import { deleteAllUserData } from '@/features/user/user.actions';

export function DeleteAllDataButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteAllUserData();
      if (result.success && result.data) {
        const { summary, duration } = result.data;
        setSuccess(
          `All data deleted successfully in ${duration}ms. ` +
            `Deleted: ${summary.organizations} orgs, ${summary.people} people, ` +
            `${summary.deals} deals, ${summary.activities} activities`
        );
      } else {
        setError('Failed to delete all data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all data');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50">
        <AlertTriangle className="size-6 text-red-600 shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-red-700">Delete ALL CRM Data</h4>
          <p className="text-sm text-red-600 mt-1">
            This will permanently delete ALL organizations, people, deals, activities, 
            notes, labels, and import records. This action CANNOT be undone.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
          className="bg-red-700 hover:bg-red-800 border-red-600"
        >
          {isDeleting ? (
            <>
              <Trash2 className="mr-2 size-4 animate-spin" />
              Deleting All Data...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 size-4" />
              Delete ALL Data Permanently
            </>
          )}
        </Button>
      </div>
    </div>
  );
}