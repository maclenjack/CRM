import { auth } from '@/auth';

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
          </div>
        </div>
      </div>
    </div>
  );
}
