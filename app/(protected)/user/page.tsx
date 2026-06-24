import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function UserPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user;

  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/sign-in' });
      }}
      className="mx-auto max-w-md p-8"
    >
      <h1 className="mb-4 text-3xl font-bold">User Profile</h1>
      <p>
        <strong>Name:</strong> {user.name ?? 'N/A'}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <Button type="submit">Sign Out</Button>
    </form>
  );
}
