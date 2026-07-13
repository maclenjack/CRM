import Link from 'next/link';

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Users,
} from 'lucide-react';

import { auth } from '@/auth';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getActivityBadgeStyles } from '@/features/activity/utils/styles';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [
    contactsCount,
    pendingActivitiesCount,
    totalPipeline,
    rawRecentActivities,
  ] = await Promise.all([
    prisma.person.count({
      where: {
        ownerId: session.user.id,
        deletedAt: null,
      },
    }),
    prisma.activity.count({
      where: {
        ownerId: session.user.id,
        done: false,
        deletedAt: null,
      },
    }),
    prisma.deal.aggregate({
      where: {
        ownerId: session.user.id,
        status: 'OPEN',
        deletedAt: null,
      },
      _sum: {
        value: true,
      },
    }),
    prisma.activity.findMany({
      take: 3,
      where: {
        ownerId: session.user.id,
        done: false,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        contactPerson: true,
      },
    }),
  ]);

  const metrics = {
    contactsCount: contactsCount.toLocaleString(),
    activeActivities: `${pendingActivitiesCount} pending`,
    pipelineValue: `$${(totalPipeline._sum.value || 0).toLocaleString()}`,
  };

  return (
    <div
      className="
        min-h-screen bg-background text-foreground transition-colors
        duration-200
      "
    >
      <div className="w-full space-y-8 px-6 py-10">
        <div className="space-y-2 border-b border-border pb-6">
          <h1
            className="
              text-3xl font-bold tracking-tight
              sm:text-4xl
            "
          >
            Welcome back, {session.user.name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your CRM workspace today.
          </p>
        </div>

        <div
          className="
            grid w-full grid-cols-1 gap-6
            sm:grid-cols-3
          "
        >
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
                  {metrics.contactsCount}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    total clients
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>

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
                  {metrics.activeActivities}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    due today
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>

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
                  {metrics.pipelineValue}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    in pipeline
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div
          className="
            grid grid-cols-1 gap-6 pt-4
            lg:grid-cols-3
          "
        >
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
            <Card className="divide-y divide-border/50 overflow-hidden">
              {rawRecentActivities.length === 0 ? (
                <div
                  className="
                    flex flex-col items-center justify-center rounded-lg border
                    border-dashed border-border/60 bg-card p-8 py-12 text-center
                  "
                >
                  <div
                    className="
                      mb-3 rounded-full bg-muted p-3 text-muted-foreground
                    "
                  >
                    <Activity className="size-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Welcome to your new workspace!
                  </p>
                  <p className="mt-1 mb-4 max-w-sm text-xs text-muted-foreground">
                    Get started by creating a pipeline, tracking a new contact,
                    or scheduling your first operational activity.
                  </p>
                  <Link
                    href="/contacts?new=true"
                    className="
                      inline-flex items-center justify-center rounded-md
                      bg-primary px-4 py-2 text-xs font-medium
                      text-primary-foreground shadow-sm transition-colors
                      hover:bg-primary/90
                    "
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Create Your First Contact
                  </Link>
                </div>
              ) : (
                rawRecentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="
                      flex items-center gap-4 bg-card p-4 transition-colors
                      hover:bg-accent/10
                    "
                  >
                    <div
                      className={`
                        shrink-0 rounded-md border px-2 py-1 text-[10px]
                        font-bold tracking-wider transition-colors select-none
                        ${getActivityBadgeStyles(act.type)}
                      `}
                    >
                      {act.type}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="
                            truncate text-sm font-semibold text-foreground/90
                          "
                        >
                          {act.subject}
                        </p>
                        <span
                          className="
                            flex shrink-0 items-center gap-1 font-mono text-xs
                            text-muted-foreground
                          "
                        >
                          <Clock className="size-3" />
                          {act.startDate.toLocaleDateString('en-NZ', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p
                        className="
                          truncate pt-0.5 text-xs text-muted-foreground
                        "
                      >
                        {act.contactPerson
                          ? `Contact: ${act.contactPerson.name}`
                          : 'No associated contact'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

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
    </div>
  );
}
