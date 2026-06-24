import { auth } from '@/auth';

export default async function PeoplePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">People</h1>
      </div>
    </>
  );
}
