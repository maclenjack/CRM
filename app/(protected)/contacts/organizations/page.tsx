import { auth } from '@/auth';

export default async function OrganizationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Organizations</h1>
      </div>
    </>
  );
}
