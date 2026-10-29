import { Building2Icon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ModalButton } from '@/components/ModalButton';
import { RecordTableCard } from '@/components/RecordTableCard';
import { Button } from '@/components/ui/button';
import { OrganizationModal } from '@/features/organization/components/OrganizationModal';
import {
  type OrganizationTableSelect,
  organizationsTableSelect,
} from '@/features/organization/organization';
import { createOrganization } from '@/features/organization/organization.actions';
import prisma from '@/lib/prisma';

import { OrganizationsTable } from './OrganizationsTable';

export async function OrganizationsTableWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const organizations: OrganizationTableSelect[] =
    await prisma.organization.findMany({
      where: { ownerId: session.user.id },
      select: organizationsTableSelect,
    });

  if (organizations.length === 0) {
    return (
      <EmptyState
        title="No organizations found"
        description="Get started by adding your first client company or partnership record to track pipelines."
        icon={Building2Icon}
        action={
          <ModalButton
            modalComponent={OrganizationModal}
            modalProps={{ onSubmitSuccess: createOrganization }}
            asChild
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 text-xs font-medium"
            >
              <PlusIcon className="mr-1.5 size-3.5" />
              Add First Organization
            </Button>
          </ModalButton>
        }
      />
    );
  }

  return (
    <RecordTableCard count={organizations.length} unitName="individual account">
      <OrganizationsTable organizations={organizations} />
    </RecordTableCard>
  );
}
