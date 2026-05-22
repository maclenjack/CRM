import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ButtonVariant, PriorityLevel } from '@/types/enums';

export function ScheduleActivityModal({
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
        <h2 className="mb-4 text-xl font-semibold">Schedule Activity</h2>
        <form className="space-y-4">
          <Input
            label="Activity Type"
            placeholder="Call, Email, Meeting"
            required
          />
          <Input label="Date & Time" type="datetime-local" required />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Priority</label>
            <PriorityBadge priority={PriorityLevel.HIGH}>High</PriorityBadge>
            <PriorityBadge priority={PriorityLevel.MEDIUM}>
              Medium
            </PriorityBadge>
            <PriorityBadge priority={PriorityLevel.LOW}>Low</PriorityBadge>
          </div>
          <Input label="Description" placeholder="Add details" />
          <Input label="Location" placeholder="Conference Room 1" />
          <Input label="Linked Deal" placeholder="Deal #123" />
          <Input label="Linked Person" placeholder="Alice Smith" />
          <Input label="Linked Organization" placeholder="Acme Corp" />
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant={ButtonVariant.SECONDARY} onClick={onClose}>
              Cancel
            </Button>
            <Button variant={ButtonVariant.PRIMARY} type="submit">
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
