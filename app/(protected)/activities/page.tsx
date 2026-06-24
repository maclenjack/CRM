import { auth } from '@/auth';
import { ActivityTable } from '@/components/ActivityTable';
import { ModalButton } from '@/components/ModalButton';
import { ScheduleActivityModal } from '@/components/ScheduleActivityModal';

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Activities</h1>
          <ModalButton Modal={ScheduleActivityModal}>
            + New Activity
          </ModalButton>
        </div>
        <ActivityTable />
      </div>
    </div>
  );
}
