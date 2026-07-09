import { auth } from '@/auth';
import { ModalButton } from '@/components/ModalButton';
import { AddOrganizationModal } from '@/features/organization/components/AddOrganizationModal';

export default async function OrganizationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Organizations</h1>
        <ModalButton Modal={AddOrganizationModal}>+ Organization</ModalButton>
      </div>
    </>
  );
}
