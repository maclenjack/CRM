import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { ButtonVariant } from '@/types';

export function AddDealModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl p-6">
        <h2 className="mb-4 text-xl font-semibold">Add Deal</h2>
        <form className="space-y-4">
          <Input label="Title" placeholder="Deal title" required />
          <Input label="Contact Person" placeholder="John Doe" />
          <Input label="Organization" placeholder="Acme Corp" />
          <Input label="Value" type="number" placeholder="0" />
          <Input label="Currency" placeholder="USD" />
          {/* <PipelineStage stage={Deal.stage} isActive={true} /> */}
          <Input label="Expected Close Date" type="date" />
          <Input label="Owner" placeholder="You" />
          <Input label="Source Channel" placeholder="LinkedIn" />
          <Input label="Source Channel ID" placeholder="12345" />
          <Input label="Visible To" placeholder="All users" />
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
