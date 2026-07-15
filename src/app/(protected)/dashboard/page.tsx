// @/app/dashboard/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  Plus,
  Users,
} from 'lucide-react';

import { auth } from '@/auth';
import { CRMPageShell } from '@/components/CRMPageShell';
import {
  ContactsCount,
  PendingActivitiesCount,
  PipelineValue,
  RecentActivityStream,
} from '@/components/DashboardMetrics';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  return (
    <CRMPageShell
      title={`Welcome back, ${session.user.name || 'User'}`}
      subtitle="Here's what's happening across your CRM workspace today."
      icon={LayoutDashboard}
    >
      <div className="space-y-8">
        {/* METRICS GRID - Instantly visible! */}
        <div
          className="
            grid w-full grid-cols-1 gap-6
            sm:grid-cols-3
          "
        >
          {/* Contacts Card */}
          <Link href="/contacts" className="group block">
            <Card
              className="
                flex h-full cursor-pointer flex-col justify-between shadow-sm
                transition-all duration-200
                group-hover:shadow-md
                hover:border-primary/50 hover:bg-accent/20
              "
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="
                      rounded-md bg-muted p-2 text-muted-foreground
                      transition-colors
                      group-hover:text-primary
                    "
                  >
                    <Users className="size-5" />
                  </div>
                  <ArrowUpRight
                    className="
                      size-4 text-muted-foreground opacity-0 transition-opacity
                      group-hover:opacity-100
                    "
                  />
                </div>
                <div className="min-h-16 space-y-1">
                  <CardTitle className="transition-colors group-hover:text-primary">
                    Contacts
                  </CardTitle>
                  <CardDescription>
                    View, edit, and organize your client list.
                  </CardDescription>
                </div>
                <div
                  className="
                    border-t border-border/50 pt-3 text-2xl font-bold
                    tracking-tight
                  "
                >
                  <Suspense
                    fallback={
                      <span
                        className="
                          inline-block h-8 w-12 animate-pulse rounded-sm
                          bg-muted
                        "
                      />
                    }
                  >
                    <ContactsCount userId={userId} />
                  </Suspense>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    total clients
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Activities Card */}
          <Link href="/activities" className="group block">
            <Card
              className="
                flex h-full cursor-pointer flex-col justify-between shadow-sm
                transition-all duration-200
                group-hover:shadow-md
                hover:border-primary/50 hover:bg-accent/20
              "
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="
                      rounded-md bg-muted p-2 text-muted-foreground
                      transition-colors
                      group-hover:text-primary
                    "
                  >
                    <Activity className="size-5" />
                  </div>
                  <ArrowUpRight
                    className="
                      size-4 text-muted-foreground opacity-0 transition-opacity
                      group-hover:opacity-100
                    "
                  />
                </div>
                <div className="min-h-16 space-y-1">
                  <CardTitle className="transition-colors group-hover:text-primary">
                    Activities
                  </CardTitle>
                  <CardDescription>
                    Track recent meetings, calls, and emails.
                  </CardDescription>
                </div>
                <div
                  className="
                    border-t border-border/50 pt-3 text-2xl font-bold
                    tracking-tight text-amber-600
                    dark:text-amber-500
                  "
                >
                  <Suspense
                    fallback={
                      <span
                        className="
                          inline-block h-8 w-24 animate-pulse rounded-sm
                          bg-muted
                        "
                      />
                    }
                  >
                    <PendingActivitiesCount userId={userId} />
                  </Suspense>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    due today
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Deals Card */}
          <Link href="/deals" className="group block">
            <Card
              className="
                flex h-full cursor-pointer flex-col justify-between shadow-sm
                transition-all duration-200
                group-hover:shadow-md
                hover:border-primary/50 hover:bg-accent/20
              "
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="
                      rounded-md bg-muted p-2 text-muted-foreground
                      transition-colors
                      group-hover:text-primary
                    "
                  >
                    <DollarSign className="size-5" />
                  </div>
                  <ArrowUpRight
                    className="
                      size-4 text-muted-foreground opacity-0 transition-opacity
                      group-hover:opacity-100
                    "
                  />
                </div>
                <div className="min-h-16 space-y-1">
                  <CardTitle className="transition-colors group-hover:text-primary">
                    Deals
                  </CardTitle>
                  <CardDescription>
                    Manage your sales pipelines via drag-and-drop.
                  </CardDescription>
                </div>
                <div
                  className="
                    border-t border-border/50 pt-3 text-2xl font-bold
                    tracking-tight
                  "
                >
                  <Suspense
                    fallback={
                      <span
                        className="
                          inline-block h-8 w-20 animate-pulse rounded-sm
                          bg-muted
                        "
                      />
                    }
                  >
                    <PipelineValue userId={userId} />
                  </Suspense>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    in pipeline
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* FEED & SHORTCUTS */}
        <div
          className="
            grid grid-cols-1 gap-6 pt-4
            lg:grid-cols-3
          "
        >
          {/* Recent Activity Stream */}
          <div
            className="
              space-y-4
              lg:col-span-2
            "
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Recent Activity Stream
              </h2>
              <Link
                href="/activities"
                className="
                  text-xs text-muted-foreground transition-colors
                  hover:text-primary
                "
              >
                View audit history
              </Link>
            </div>

            <Suspense
              fallback={
                <Card className="divide-y divide-border/50 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center gap-4 p-4"
                    >
                      <div className="h-6 w-14 rounded-sm bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded-sm bg-muted" />
                        <div className="h-3 w-1/4 rounded-sm bg-muted" />
                      </div>
                    </div>
                  ))}
                </Card>
              }
            >
              <RecentActivityStream userId={userId} />
            </Suspense>
          </div>

          {/* Quick Shortcuts (Instantly Active!) */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Quick Shortcuts
            </h2>
            <Card className="h-fit space-y-3 bg-card p-4">
              <Link
                href="/contacts?new=true"
                className="
                  group flex items-center justify-between rounded-md border
                  border-border bg-background p-3 transition-all
                  hover:border-primary/30 hover:bg-accent/40
                "
              >
                <span className="text-sm leading-none font-medium">
                  Add New Client
                </span>
                <Plus
                  className="
                    size-4 text-muted-foreground transition-colors
                    group-hover:text-primary
                  "
                />
              </Link>
              <Link
                href="/deals?new=true"
                className="
                  group flex items-center justify-between rounded-md border
                  border-border bg-background p-3 transition-all
                  hover:border-primary/30 hover:bg-accent/40
                "
              >
                <span className="text-sm leading-none font-medium">
                  Create Sale Pipeline
                </span>
                <Plus
                  className="
                    size-4 text-muted-foreground transition-colors
                    group-hover:text-primary
                  "
                />
              </Link>
              <Link
                href="/activities?schedule=true"
                className="
                  group flex items-center justify-between rounded-md border
                  border-border bg-background p-3 transition-all
                  hover:border-primary/30 hover:bg-accent/40
                "
              >
                <span className="text-sm leading-none font-medium">
                  Schedule Meeting Log
                </span>
                <CheckCircle2
                  className="
                    size-4 text-muted-foreground transition-colors
                    group-hover:text-primary
                  "
                />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </CRMPageShell>
  );
}
