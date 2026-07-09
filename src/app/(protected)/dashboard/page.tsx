import { auth } from '@/auth';
import { NavLink } from '@/components/NavLink';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>View and manage all your contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <CardAction>
              <NavLink href="/contacts">Go to Contacts</NavLink>
            </CardAction>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>Track all recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <CardAction>
              <NavLink href="/activities">Go to Activities</NavLink>
            </CardAction>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deals</CardTitle>
            <CardDescription>
              Manage your deals with a drag and drop board
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardAction>
              <NavLink href="/deals">Go to Deals</NavLink>
            </CardAction>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
