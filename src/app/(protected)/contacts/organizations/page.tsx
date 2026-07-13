import { Building2Icon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { ModalButton } from '@/components/ModalButton';
import { EmptyTable } from '@/components/table/EmptyTable';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddOrganizationModal } from '@/features/organization/components/AddOrganizationModal';
import { OrganizationsTable } from '@/features/organization/components/OrganizationsTable';
import {
  type OrganizationTableSelect,
  organizationsTableSelect,
} from '@/features/organization/organization';
import { createOrganization } from '@/features/organization/organization.actions';
import prisma from '@/lib/prisma';

export default async function OrganizationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const organizations: OrganizationTableSelect[] =
    await prisma.organization.findMany({
      where: { ownerId: session?.user.id },
      select: organizationsTableSelect,
    });

  return (
    <div
      className="
        mx-auto w-full max-w-7xl space-y-8 p-6
        md:p-10
      "
    >
      <div
        className="
          flex flex-col gap-4 border-b border-muted/60 pb-6
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div>
          <h1
            className="
              flex items-center gap-3 text-3xl font-bold tracking-tight
              text-foreground
            "
          >
            <Building2Icon className="size-7 text-secondary" />
            Organizations
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your corporate accounts, tracking interactions, active deals,
            and key contacts.
          </p>
        </div>

        <div
          className="
            flex items-center gap-2 self-start
            sm:self-auto
          "
        >
          <ModalButton
            modalComponent={AddOrganizationModal}
            modalProps={{ onSubmitSuccess: createOrganization }}
            asChild
          >
            <Button size="sm" className="gap-2 font-medium shadow-sm">
              <PlusIcon className="size-4" />
              New Organization
            </Button>
          </ModalButton>
        </div>
      </div>

      {organizations.length === 0 ? (
        <EmptyTable
          title="No organizations found"
          description="Get started by adding your first client company or partnership record to track pipelines."
          icon={Building2Icon}
          action={
            <ModalButton
              modalComponent={AddOrganizationModal}
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
      ) : (
        <Card
          className="
            overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs
          "
        >
          <CardHeader className="border-b border-border/50 bg-muted/30 px-6 py-5">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                All Records
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {organizations.length}
                </span>{' '}
                individual account{organizations.length > 1 ? 's' : ''} mapped
                to your profile.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <OrganizationsTable organizations={organizations} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
