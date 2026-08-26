import { Suspense } from 'react';

import { Building2Icon, PlusIcon } from 'lucide-react';

import { CRMPageShell } from '@/components/CRMPageShell';
import { ModalButton } from '@/components/ModalButton';
import { TableLoadingPlaceholder } from '@/components/table/TableLoadingPlaceholder';
import { Button } from '@/components/ui/button';
import { OrganizationModal } from '@/features/organization/components/OrganizationModal';
import { OrganizationsTableWrapper } from '@/features/organization/components/OrganizationsTableWrapper';
import { createOrganization } from '@/features/organization/organization.actions';

export default function OrganizationsPage() {
  return (
    <CRMPageShell
      title="Organizations"
      subtitle="Manage your corporate accounts, tracking interactions, active deals, and key contacts."
      icon={Building2Icon}
      actionButton={
        <ModalButton
          modalComponent={OrganizationModal}
          modalProps={{ onSubmitSuccess: createOrganization }}
          asChild
        >
          <Button size="sm" className="gap-2 font-medium shadow-sm">
            <PlusIcon className="size-4" />
            New Organization
          </Button>
        </ModalButton>
      }
    >
      <Suspense fallback={<TableLoadingPlaceholder />}>
        <OrganizationsTableWrapper />
      </Suspense>
    </CRMPageShell>
  );
}
