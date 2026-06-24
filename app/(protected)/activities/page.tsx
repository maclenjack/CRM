import { auth } from '@/auth';

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Activities</h1>
        </div>
      </div>
    </div>
  );
}
