import { auth } from '@/auth';
import { Card } from '@/components/Card';
import { NavLink } from '@/components/NavLink';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-50 py-12">
      <h1 className="mb-8 text-4xl font-semibold text-neutral-900">
        Welcome to CRM
      </h1>
      <p className="mb-12 text-lg text-neutral-600">
        Manage your contacts, activities, and deals all in one place.
      </p>

      <div
        className="
          grid w-full max-w-4xl grid-cols-1 gap-8 px-4
          sm:grid-cols-3
        "
      >
        <Card title="Contacts" subtitle="View and manage all your contacts">
          <NavLink href="/contacts">Go to Contacts</NavLink>
        </Card>
        <Card title="Activities" subtitle="Track all recent activities">
          <NavLink href="/activities">Go to Activities</NavLink>
        </Card>
        <Card
          title="Deals"
          subtitle="Manage your deals with a Trello-style board"
        >
          <NavLink href="/deals">Go to Deals</NavLink>
        </Card>
      </div>
    </div>
  );
}
