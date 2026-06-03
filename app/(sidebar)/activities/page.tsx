import {
  ActivityTable,
  ModalButton,
  ScheduleActivityModal,
} from '@/components';

export default function ActivitiesPage() {
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
