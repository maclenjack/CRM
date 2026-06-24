'use client';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { ButtonVariant } from '@/models';

export function AddOrganizationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <h2 className="mb-4 text-xl font-semibold">Add Person</h2>
        <form className="space-y-4">
          <Input label="Name" placeholder="Acme Corp" required />
          <Input label="Labels" placeholder="Lead, VIP" />
          <Input label="Owner" placeholder="Jane Smith" />
          <Input label="Address" placeholder="123 Street Name" />
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant={ButtonVariant.SECONDARY} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
