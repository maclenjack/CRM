// app/dashboard/page.tsx
import { Card } from '@/components/Card';
import { NavLink } from '@/components/NavLink';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background py-12">
      <h1 className="mb-8 text-4xl font-semibold">Welcome to CRM</h1>
      <p className="mb-12 text-lg text-secondary">
        Manage your contacts, activities, and deals all in one place.
      </p>

      <div
        className="
          grid w-full max-w-4xl grid-cols-1 gap-8 px-4
          sm:grid-cols-3
        "
      >
        <Card title="Contacts" subtitle="View and manage all your contacts">
          <NavLink href="/contacts" active={false}>
            Go to Contacts
          </NavLink>
        </Card>
        <Card title="Activities" subtitle="Track all recent activities">
          <NavLink href="/activities" active={false}>
            Go to Activities
          </NavLink>
        </Card>
        <Card
          title="Deals"
          subtitle="Manage your deals with a Trello‑style board"
        >
          <NavLink href="/deals" active={false}>
            Go to Deals
          </NavLink>
        </Card>
      </div>
    </div>
  );
}
