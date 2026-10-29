import Link from 'next/link';

import { Activity, Clock, Plus } from 'lucide-react';

import { getActivityBadgeStyles } from '@/features/activity/utils/styles';
import prisma from '@/lib/prisma';

interface MetricProps {
  userId: string;
}

export async function ContactsCount({ userId }: MetricProps) {
  const count = await prisma.person.count({
    where: { ownerId: userId },
  });
  return <>{count.toLocaleString()}</>;
}

export async function PendingActivitiesCount({ userId }: MetricProps) {
  const count = await prisma.activity.count({
    where: { ownerId: userId, isDone: false },
  });
  return <>{count} pending</>;
}

export async function PipelineValue({ userId }: MetricProps) {
  const aggregate = await prisma.deal.aggregate({
    where: { ownerId: userId, status: 'OPEN' },
    _sum: { value: true },
  });
  const value = aggregate._sum.value || 0;
  return <>${value.toLocaleString()}</>;
}

export async function RecentActivityStream({ userId }: MetricProps) {
  const rawRecentActivities = await prisma.activity.findMany({
    take: 3,
    where: { ownerId: userId, isDone: false },
    orderBy: { createdAt: 'desc' },
    include: { contactPerson: true },
  });

  if (rawRecentActivities.length === 0) {
    return (
      <div
        className="
          flex flex-col items-center justify-center rounded-lg border
          border-dashed border-border/60 bg-card p-8 py-12 text-center
        "
      >
        <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
          <Activity className="size-6" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Welcome to your new workspace!
        </p>

        <p className="mt-1 mb-4 max-w-sm text-xs text-muted-foreground">
          Get started by creating a pipeline, tracking a new contact, or
          scheduling your first operational activity.
        </p>
        <Link
          href="/contacts?new=true"
          className="
            inline-flex items-center justify-center rounded-md bg-primary px-4
            py-2 text-xs font-medium text-primary-foreground shadow-sm
            transition-colors
            hover:bg-primary/90
          "
        >
          <Plus className="mr-1.5 size-3.5" /> Create Your First Contact
        </Link>
      </div>
    );
  }

  return (
    <div
      className="
        divide-y divide-border/50 overflow-hidden rounded-xl border bg-card
      "
    >
      {rawRecentActivities.map((act) => (
        <div
          key={act.id}
          className="
            flex items-center gap-4 bg-card p-4 transition-colors
            hover:bg-accent/10
          "
        >
          <div
            className={`
              shrink-0 rounded-md border px-2 py-1 text-[10px] font-bold
              tracking-wider transition-colors select-none
              ${getActivityBadgeStyles(act.type)}
            `}
          >
            {act.type}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-foreground/90">
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
            <p className="truncate pt-0.5 text-xs text-muted-foreground">
              {act.contactPerson
                ? `Contact: ${act.contactPerson.name}`
                : 'No associated contact'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
