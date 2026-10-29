'use client';

import { useState } from 'react';

import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { mapDealToOption } from '@/features/deal/deal';
import { searchDeals } from '@/features/deal/deal.actions';
import { cn } from '@/features/shared/utils/cn';
import { hardDeleteUser, searchUsers } from '@/features/user/user.actions';

function mapUserOption(user: {
  id: string;
  name: string | null;
  email: string | null;
}) {
  return {
    value: user.id,
    label: user.name ?? 'Unnamed User',
    description: user.email ?? '',
  };
}

export function HardDeleteUserForm() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async () => {
    if (!selectedUserId) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await hardDeleteUser(selectedUserId);
      setSuccess('User deleted successfully');
      setSelectedUserId(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* <AsyncCombobox
              value={value as string}
              initialLabel={currentDeal?.title}
              onChange={onChange}
              disabled={disabled}
              placeholder="Search deals..."
              fetchOptions={searchDeals}
              mapOption={mapDealToOption}
            /> */}
      <AsyncCombobox
        placeholder="Search for a user by name..."
        searchPlaceholder="Type at least 2 characters to search..."
        emptyMessage="No users found"
        fetchOptions={searchUsers}
        mapOption={mapUserOption}
        onChange={setSelectedUserId}
        value={selectedUserId}
        label="Select User to Delete"
        required
        refreshKey={refreshKey}
      />

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
          disabled={!selectedUserId || isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? 'Deleting...' : 'Permanently Delete User'}
        </Button>
      </div>
    </div>
  );
}
