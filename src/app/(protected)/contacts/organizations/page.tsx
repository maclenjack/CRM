import { auth } from '@/auth';
import { ModalButton } from '@/components/ModalButton';
import { EmptyTable } from '@/components/table/EmptyTable';
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
    <div className="flex min-h-screen bg-background text-foreground">
      <div
        className="
          mx-auto w-full max-w-7xl flex-1 space-y-6 p-6
          md:p-8
        "
      >
        <div
          className="
            flex flex-col gap-4 border-b pb-6
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log, track, and manage recent tasks, calls, and follow-ups.
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
            >
              + Organization
            </ModalButton>
          </div>
        </div>

        <Card className="overflow-hidden border-muted shadow-sm">
          {organizations.length === 0 ? (
            <EmptyTable />
          ) : (
            <>
              <CardHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      Activity Log
                    </CardTitle>
                    <CardDescription>
                      Showing {organizations.length} total{' '}
                      {organizations.length > 1 ? 'records' : 'record'} for your
                      account.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <OrganizationsTable organizations={organizations} />
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
