import { auth } from '@/auth';
import { AddDealModal } from '@/components/AddDealModal';
import { ModalButton } from '@/components/ModalButton';

// TODO: Add Kanban Board back
export default async function DealsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Pipeline
            </h1>
            <p className="text-sm text-neutral-600">0 deals</p>
          </div>
          <ModalButton Modal={AddDealModal}>+ Deal</ModalButton>
        </div>
      </div>
    </div>
  );
}
