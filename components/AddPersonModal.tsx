'use client';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { ButtonVariant } from '@/models';

export function AddPersonModal({
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
          <Input label="Name" placeholder="John Doe" required />
          <Input label="Organization" placeholder="Acme Corp" />
          <Input label="Phone" placeholder="+1 555 1234" />
          <Input label="Email" placeholder="john@example.com" />
          <Input label="Labels" placeholder="Lead, VIP" />
          <Input label="Owner" placeholder="Jane Smith" />
          <Input label="Visible to" placeholder="Team" />
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
