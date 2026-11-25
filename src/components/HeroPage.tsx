'use client';

import Link from 'next/link';

import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CircleCheck,
  DollarSign,
  Globe,
  Target,
  Users,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthModals } from '@/features/auth/components/AuthModals';
import { cn } from '@/features/shared/utils/cn';

const features = [
  {
    icon: Users,
    title: 'Contact Management',
    description:
      'Organize all your contacts in one place. Track interactions, add notes, and never miss a follow-up.',
  },
  {
    icon: Building2,
    title: 'Organization Tracking',
    description:
      'Manage company relationships with detailed profiles, associated contacts, and deal history.',
  },
  {
    icon: Target,
    title: 'Deal Pipeline',
    description:
      'Visualize your sales pipeline with customizable stages. Drag and drop deals to track progress.',
  },
  {
    icon: Activity,
    title: 'Activity Timeline',
    description:
      'Log calls, meetings, emails, and tasks. Complete activity history for every contact and deal.',
  },
  {
    icon: BarChart3,
    title: 'Insights & Reports',
    description:
      'Track performance with dashboards showing conversion rates, pipeline velocity, and team metrics.',
  },
  {
    icon: Zap,
    title: 'Quick Import',
    description:
      'Migrate from Pipedrive in minutes. Preserve your data relationships.',
  },
];

const integrations = [
  { name: 'Pipedrive', description: 'Import contacts, deals, and activities' },
  {
    name: 'More coming soon',
    description: 'Additional import sources available upon request',
  },
];

interface HeroPageProps {
  stats: {
    contacts: number;
    organizations: number;
    deals: number;
    activities: number;
  };
}

export function HeroPage({ stats }: HeroPageProps) {
  const { openSignIn, openRegister } = useAuthModals();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header
        className="
          fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95
          backdrop-blur-sm
          supports-backdrop-filter:bg-background/60
        "
      >
        <nav
          className="
            mx-auto max-w-7xl px-4
            sm:px-6
            lg:px-8
          "
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="CRM Home"
              >
                <div
                  className="
                    flex size-8 items-center justify-center rounded-lg
                    bg-primary text-primary-foreground
                  "
                >
                  <Target className="size-5" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold">CRM</span>
              </Link>
              <div
                className="
                  hidden items-center gap-6
                  md:flex
                "
              >
                <Link
                  href="#features"
                  className="
                    text-sm font-medium text-muted-foreground transition-colors
                    hover:text-foreground
                  "
                >
                  Features
                </Link>
                <Link
                  href="#integrations"
                  className="
                    text-sm font-medium text-muted-foreground transition-colors
                    hover:text-foreground
                  "
                >
                  Integrations
                </Link>
                <Link
                  href="#stats"
                  className="
                    text-sm font-medium text-muted-foreground transition-colors
                    hover:text-foreground
                  "
                >
                  Stats
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={openSignIn}>
                Sign In
              </Button>
              <Button size="sm" onClick={openRegister}>
                Get Started Free
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section
          className="
            relative overflow-hidden py-20
            sm:py-32
            lg:py-40
          "
          aria-labelledby="hero-heading"
        >
          <div
            className="
              mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
          >
            <div className="mx-auto max-w-3xl text-center">
              <h1
                id="hero-heading"
                className="
                  mb-6 text-4xl font-bold tracking-tight text-foreground
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                The CRM that{' '}
                <span className="text-primary">helps you close</span> <br />
                more deals, faster
              </h1>
              <p
                className="
                  mx-auto mb-8 max-w-2xl text-lg/relaxed text-muted-foreground
                  sm:text-xl
                "
              >
                Manage contacts, track deals, and automate your sales pipeline.
                Built for teams who want to focus on selling, not software.
              </p>
              <div
                className="
                  mb-12 flex flex-col items-center justify-center gap-4
                  sm:flex-row
                "
              >
                <Button
                  size="lg"
                  className="
                    w-full gap-2
                    sm:w-auto
                  "
                  onClick={openRegister}
                >
                  Get Started Free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="
                    w-full
                    sm:w-auto
                  "
                  onClick={openSignIn}
                >
                  Sign In
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Completely free · No credit card required
              </p>
            </div>

            {/* Hero Visual - Dashboard Preview */}
            <div className="relative mt-16" aria-hidden="true">
              <div className="mx-auto max-w-5xl">
                <div
                  className="
                    overflow-hidden rounded-xl border border-border bg-card
                    shadow-2xl
                  "
                >
                  <div
                    className="
                      flex items-center gap-2 border-b border-border bg-muted/50
                      px-4 py-3
                    "
                  >
                    <div className="flex gap-1.5">
                      <div className="size-3 rounded-full bg-red-500" />
                      <div className="size-3 rounded-full bg-yellow-500" />
                      <div className="size-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div
                    className="
                      space-y-8 p-6
                      lg:p-8
                    "
                  >
                    {/* Top Metric Cards */}
                    <div
                      className="
                        grid grid-cols-1 gap-6
                        sm:grid-cols-3
                      "
                    >
                      <div className="group">
                        <div
                          className="
                            group/card flex h-full flex-col justify-between
                            gap-(--card-spacing) overflow-hidden rounded-xl
                            bg-card py-(--card-spacing) text-sm
                            text-card-foreground shadow-sm ring-1
                            ring-foreground/10 transition-all duration-200
                            [--card-spacing:--spacing(4)]
                            group-hover:shadow-md
                            hover:border-primary/50 hover:bg-accent/20
                            has-data-[slot=card-footer]:pb-0
                            has-[>img:first-child]:pt-0
                            data-[size=sm]:[--card-spacing:--spacing(3)]
                            data-[size=sm]:has-data-[slot=card-footer]:pb-0
                            *:[img:first-child]:rounded-t-xl
                            *:[img:last-child]:rounded-b-xl
                          "
                        >
                          <div
                            className="
                              group/card-header @container/card-header grid
                              auto-rows-min items-start gap-1 space-y-4
                              rounded-t-xl px-(--card-spacing)
                              has-data-[slot=card-action]:grid-cols-[1fr_auto]
                              has-data-[slot=card-description]:grid-rows-[auto_auto]
                              [.border-b]:pb-(--card-spacing)
                            "
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="
                                  rounded-md bg-muted p-2 text-muted-foreground
                                  transition-colors
                                  group-hover:text-primary
                                "
                              >
                                <Users className="size-5" aria-hidden="true" />
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="
                                  lucide lucide-arrow-up-right size-4
                                  text-muted-foreground opacity-0
                                  transition-opacity
                                  group-hover:opacity-100
                                "
                                aria-hidden="true"
                              >
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                              </svg>
                            </div>
                            <div className="min-h-16 space-y-1">
                              <div
                                className="
                                  font-heading text-base/snug font-medium
                                  transition-colors
                                  group-hover:text-primary
                                  group-data-[size=sm]/card:text-sm
                                "
                              >
                                Contacts
                              </div>
                              <div className="text-sm text-muted-foreground">
                                View, edit, and organize your client list.
                              </div>
                            </div>
                            <div
                              className="
                                border-t border-border/50 pt-3 text-2xl
                                font-bold tracking-tight
                              "
                            >
                              247
                              <span
                                className="
                                  ml-2 text-xs font-normal text-muted-foreground
                                "
                              >
                                total clients
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div
                          className="
                            group/card flex h-full flex-col justify-between
                            gap-(--card-spacing) overflow-hidden rounded-xl
                            bg-card py-(--card-spacing) text-sm
                            text-card-foreground shadow-sm ring-1
                            ring-foreground/10 transition-all duration-200
                            [--card-spacing:--spacing(4)]
                            group-hover:shadow-md
                            hover:border-primary/50 hover:bg-accent/20
                            has-data-[slot=card-footer]:pb-0
                            has-[>img:first-child]:pt-0
                            data-[size=sm]:[--card-spacing:--spacing(3)]
                            data-[size=sm]:has-data-[slot=card-footer]:pb-0
                            *:[img:first-child]:rounded-t-xl
                            *:[img:last-child]:rounded-b-xl
                          "
                        >
                          <div
                            className="
                              group/card-header @container/card-header grid
                              auto-rows-min items-start gap-1 space-y-4
                              rounded-t-xl px-(--card-spacing)
                              has-data-[slot=card-action]:grid-cols-[1fr_auto]
                              has-data-[slot=card-description]:grid-rows-[auto_auto]
                              [.border-b]:pb-(--card-spacing)
                            "
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="
                                  rounded-md bg-muted p-2 text-muted-foreground
                                  transition-colors
                                  group-hover:text-primary
                                "
                              >
                                <Activity
                                  className="size-5"
                                  aria-hidden="true"
                                />
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="
                                  lucide lucide-arrow-up-right size-4
                                  text-muted-foreground opacity-0
                                  transition-opacity
                                  group-hover:opacity-100
                                "
                                aria-hidden="true"
                              >
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                              </svg>
                            </div>
                            <div className="min-h-16 space-y-1">
                              <div
                                className="
                                  font-heading text-base/snug font-medium
                                  transition-colors
                                  group-hover:text-primary
                                  group-data-[size=sm]/card:text-sm
                                "
                              >
                                Activities
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Track recent meetings, calls, and emails.
                              </div>
                            </div>
                            <div
                              className="
                                border-t border-border/50 pt-3 text-2xl
                                font-bold tracking-tight text-amber-600
                                dark:text-amber-500
                              "
                            >
                              12 pending
                              <span
                                className="
                                  ml-2 text-xs font-normal text-muted-foreground
                                "
                              >
                                due this week
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div
                          className="
                            group/card flex h-full flex-col justify-between
                            gap-(--card-spacing) overflow-hidden rounded-xl
                            bg-card py-(--card-spacing) text-sm
                            text-card-foreground shadow-sm ring-1
                            ring-foreground/10 transition-all duration-200
                            [--card-spacing:--spacing(4)]
                            group-hover:shadow-md
                            hover:border-primary/50 hover:bg-accent/20
                            has-data-[slot=card-footer]:pb-0
                            has-[>img:first-child]:pt-0
                            data-[size=sm]:[--card-spacing:--spacing(3)]
                            data-[size=sm]:has-data-[slot=card-footer]:pb-0
                            *:[img:first-child]:rounded-t-xl
                            *:[img:last-child]:rounded-b-xl
                          "
                        >
                          <div
                            className="
                              group/card-header @container/card-header grid
                              auto-rows-min items-start gap-1 space-y-4
                              rounded-t-xl px-(--card-spacing)
                              has-data-[slot=card-action]:grid-cols-[1fr_auto]
                              has-data-[slot=card-description]:grid-rows-[auto_auto]
                              [.border-b]:pb-(--card-spacing)
                            "
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="
                                  rounded-md bg-muted p-2 text-muted-foreground
                                  transition-colors
                                  group-hover:text-primary
                                "
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  className="lucide lucide-dollar-sign size-5"
                                  aria-hidden="true"
                                >
                                  <line x1="12" x2="12" y1="2" y2="22"></line>
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="
                                  lucide lucide-arrow-up-right size-4
                                  text-muted-foreground opacity-0
                                  transition-opacity
                                  group-hover:opacity-100
                                "
                                aria-hidden="true"
                              >
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                              </svg>
                            </div>
                            <div className="min-h-16 space-y-1">
                              <div
                                className="
                                  font-heading text-base/snug font-medium
                                  transition-colors
                                  group-hover:text-primary
                                  group-data-[size=sm]/card:text-sm
                                "
                              >
                                Deals
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Manage your sales pipelines via drag-and-drop.
                              </div>
                            </div>
                            <div
                              className="
                                border-t border-border/50 pt-3 text-2xl
                                font-bold tracking-tight
                              "
                            >
                              $127K
                              <span
                                className="
                                  ml-2 text-xs font-normal text-muted-foreground
                                "
                              >
                                in pipeline
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Recent Activity Stream + Quick Shortcuts */}
                    <div
                      className="
                        grid grid-cols-1 gap-6
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
                          <span className="text-xs text-muted-foreground">
                            View audit history
                          </span>
                        </div>
                        <div
                          className="
                            divide-y divide-border/50 overflow-hidden rounded-xl
                            border bg-card
                          "
                        >
                          <div
                            className="
                              flex items-center gap-4 bg-card p-4
                              transition-colors
                              hover:bg-accent/10
                            "
                          >
                            <div
                              className="
                                shrink-0 rounded-md border border-emerald-200/50
                                bg-emerald-50 px-2 py-1 text-[10px] font-bold
                                tracking-wider text-emerald-700
                                transition-colors select-none
                                dark:border-emerald-800/30
                                dark:bg-emerald-950/40 dark:text-emerald-400
                              "
                            >
                              CALL
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex items-center justify-between gap-2
                                "
                              >
                                <p
                                  className="
                                    truncate text-sm font-semibold
                                    text-foreground/90
                                  "
                                >
                                  Follow up with Acme Corp
                                </p>
                                <span
                                  className="
                                    flex shrink-0 items-center gap-1 font-mono
                                    text-xs text-muted-foreground
                                  "
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-clock size-3"
                                    aria-hidden="true"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                  </svg>
                                  2 hours ago
                                </span>
                              </div>
                              <p
                                className="
                                  truncate pt-0.5 text-xs text-muted-foreground
                                "
                              >
                                Contact: Sarah Mitchell, VP Sales
                              </p>
                            </div>
                          </div>
                          <div
                            className="
                              flex items-center gap-4 bg-card p-4
                              transition-colors
                              hover:bg-accent/10
                            "
                          >
                            <div
                              className="
                                shrink-0 rounded-md border border-blue-200/50
                                bg-blue-50 px-2 py-1 text-[10px] font-bold
                                tracking-wider text-blue-700 transition-colors
                                select-none
                                dark:border-blue-800/30 dark:bg-blue-950/40
                                dark:text-blue-400
                              "
                            >
                              MEETING
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex items-center justify-between gap-2
                                "
                              >
                                <p
                                  className="
                                    truncate text-sm font-semibold
                                    text-foreground/90
                                  "
                                >
                                  Demo with TechStart Inc
                                </p>
                                <span
                                  className="
                                    flex shrink-0 items-center gap-1 font-mono
                                    text-xs text-muted-foreground
                                  "
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-clock size-3"
                                    aria-hidden="true"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                  </svg>
                                  Yesterday
                                </span>
                              </div>
                              <p
                                className="
                                  truncate pt-0.5 text-xs text-muted-foreground
                                "
                              >
                                Contact: James Chen, CTO
                              </p>
                            </div>
                          </div>
                          <div
                            className="
                              flex items-center gap-4 bg-card p-4
                              transition-colors
                              hover:bg-accent/10
                            "
                          >
                            <div
                              className="
                                shrink-0 rounded-md border border-purple-200/50
                                bg-purple-50 px-2 py-1 text-[10px] font-bold
                                tracking-wider text-purple-700 transition-colors
                                select-none
                                dark:border-purple-800/30 dark:bg-purple-950/40
                                dark:text-purple-400
                              "
                            >
                              EMAIL
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex items-center justify-between gap-2
                                "
                              >
                                <p
                                  className="
                                    truncate text-sm font-semibold
                                    text-foreground/90
                                  "
                                >
                                  Sent proposal to GlobalLogistics
                                </p>
                                <span
                                  className="
                                    flex shrink-0 items-center gap-1 font-mono
                                    text-xs text-muted-foreground
                                  "
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-clock size-3"
                                    aria-hidden="true"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                  </svg>
                                  2 days ago
                                </span>
                              </div>
                              <p
                                className="
                                  truncate pt-0.5 text-xs text-muted-foreground
                                "
                              >
                                Contact: Maria Rodriguez, Procurement
                              </p>
                            </div>
                          </div>
                          <div
                            className="
                              flex items-center gap-4 bg-card p-4
                              transition-colors
                              hover:bg-accent/10
                            "
                          >
                            <div
                              className="
                                shrink-0 rounded-md border border-amber-200/50
                                bg-amber-50 px-2 py-1 text-[10px] font-bold
                                tracking-wider text-amber-700 transition-colors
                                select-none
                                dark:border-amber-800/30 dark:bg-amber-950/40
                                dark:text-amber-400
                              "
                            >
                              TASK
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex items-center justify-between gap-2
                                "
                              >
                                <p
                                  className="
                                    truncate text-sm font-semibold
                                    text-foreground/90
                                  "
                                >
                                  Review contract terms
                                </p>
                                <span
                                  className="
                                    flex shrink-0 items-center gap-1 font-mono
                                    text-xs text-muted-foreground
                                  "
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-clock size-3"
                                    aria-hidden="true"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                  </svg>
                                  3 days ago
                                </span>
                              </div>
                              <p
                                className="
                                  truncate pt-0.5 text-xs text-muted-foreground
                                "
                              >
                                Deal: Enterprise License Renewal
                              </p>
                            </div>
                          </div>
                          <div
                            className="
                              flex items-center gap-4 bg-card p-4
                              transition-colors
                              hover:bg-accent/10
                            "
                          >
                            <div
                              className="
                                shrink-0 rounded-md border border-emerald-200/50
                                bg-emerald-50 px-2 py-1 text-[10px] font-bold
                                tracking-wider text-emerald-700
                                transition-colors select-none
                                dark:border-emerald-800/30
                                dark:bg-emerald-950/40 dark:text-emerald-400
                              "
                            >
                              CALL
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex items-center justify-between gap-2
                                "
                              >
                                <p
                                  className="
                                    truncate text-sm font-semibold
                                    text-foreground/90
                                  "
                                >
                                  Discovery call with Meridian Health
                                </p>
                                <span
                                  className="
                                    flex shrink-0 items-center gap-1 font-mono
                                    text-xs text-muted-foreground
                                  "
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="lucide lucide-clock size-3"
                                    aria-hidden="true"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                  </svg>
                                  5 days ago
                                </span>
                              </div>
                              <p
                                className="
                                  truncate pt-0.5 text-xs text-muted-foreground
                                "
                              >
                                Contact: Dr. Amanda Foster, CMO
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight">
                          Quick Shortcuts
                        </h2>
                        <div
                          className="
                            group/card flex h-fit flex-col gap-(--card-spacing)
                            space-y-3 overflow-hidden rounded-xl bg-card p-4
                            text-sm text-card-foreground ring-1
                            ring-foreground/10 [--card-spacing:--spacing(4)]
                            has-data-[slot=card-footer]:pb-0
                            has-[>img:first-child]:pt-0
                            data-[size=sm]:[--card-spacing:--spacing(3)]
                            data-[size=sm]:has-data-[slot=card-footer]:pb-0
                            *:[img:first-child]:rounded-t-xl
                            *:[img:last-child]:rounded-b-xl
                          "
                        >
                          <div
                            className="
                              group flex items-center justify-between rounded-md
                              border border-border bg-background p-3
                              transition-all
                              hover:border-primary/30 hover:bg-accent/40
                            "
                          >
                            <span className="text-sm leading-none font-medium">
                              Add New Client
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="
                                lucide lucide-plus size-4 text-muted-foreground
                                transition-colors
                                group-hover:text-primary
                              "
                              aria-hidden="true"
                            >
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </div>
                          <div
                            className="
                              group flex items-center justify-between rounded-md
                              border border-border bg-background p-3
                              transition-all
                              hover:border-primary/30 hover:bg-accent/40
                            "
                          >
                            <span className="text-sm leading-none font-medium">
                              Create Sale Pipeline
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="
                                lucide lucide-plus size-4 text-muted-foreground
                                transition-colors
                                group-hover:text-primary
                              "
                              aria-hidden="true"
                            >
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </div>
                          <div
                            className="
                              group flex items-center justify-between rounded-md
                              border border-border bg-background p-3
                              transition-all
                              hover:border-primary/30 hover:bg-accent/40
                            "
                          >
                            <span className="text-sm leading-none font-medium">
                              Schedule Meeting Log
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="
                                lucide lucide-circle-check size-4
                                text-muted-foreground transition-colors
                                group-hover:text-primary
                              "
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="m9 12 2 2 4-4"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="
            py-20
            sm:py-28
            lg:py-32
          "
          aria-labelledby="features-heading"
        >
          <div
            className="
              mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
          >
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2
                id="features-heading"
                className="
                  mb-4 text-3xl font-bold tracking-tight text-foreground
                  sm:text-4xl
                "
              >
                Everything you need to{' '}
                <span className="text-primary">manage relationships</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed for modern sales teams. No bloat,
                just results.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="
                    h-full transition-shadow
                    hover:shadow-lg
                  "
                >
                  <CardHeader>
                    <div
                      className="
                        mb-3 inline-flex size-10 items-center justify-center
                        rounded-lg bg-primary/10 text-primary
                      "
                    >
                      <feature.icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section
          id="integrations"
          className="
            bg-muted/30 py-20
            sm:py-28
            lg:py-32
          "
          aria-labelledby="integrations-heading"
        >
          <div
            className="
              mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
          >
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2
                id="integrations-heading"
                className="
                  mb-4 text-3xl font-bold tracking-tight text-foreground
                  sm:text-4xl
                "
              >
                Connect the tools you{' '}
                <span className="text-primary">already use</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Pipedrive import is available now. Additional import sources
                available upon request.
              </p>
            </div>
            <div
              className="
                grid grid-cols-1 gap-6
                md:grid-cols-2
              "
            >
              {integrations.map((integration, index) => (
                <Card
                  key={index}
                  className="
                    h-full p-6 text-center transition-shadow
                    hover:shadow-lg
                  "
                >
                  <div
                    className="
                      mx-auto mb-4 inline-flex size-12 items-center
                      justify-center rounded-xl bg-primary/10 text-primary
                    "
                  >
                    <Globe className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-1 font-semibold">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section
          id="stats"
          className="
            py-20
            sm:py-28
            lg:py-32
          "
          aria-labelledby="stats-heading"
        >
          <div
            className="
              mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
          >
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2
                id="stats-heading"
                className="
                  mb-4 text-3xl font-bold tracking-tight text-foreground
                  sm:text-4xl
                "
              >
                Trusted by growing teams{' '}
                <span className="text-primary">worldwide</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Real results from teams who switched to our CRM.
              </p>
            </div>
            <div
              className="
                grid grid-cols-2 gap-6
                sm:gap-8
                lg:grid-cols-4
              "
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div
                    className="
                      mx-auto mb-4 inline-flex size-12 items-center
                      justify-center rounded-xl bg-primary/10 text-primary
                    "
                  >
                    <Users className="size-6" aria-hidden="true" />
                  </div>
                  <div
                    className="
                      mb-1 text-3xl font-bold text-foreground
                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    {stats.contacts.toLocaleString()}
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Contacts
                  </div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div
                    className="
                      mx-auto mb-4 inline-flex size-12 items-center
                      justify-center rounded-xl bg-primary/10 text-primary
                    "
                  >
                    <Building2 className="size-6" aria-hidden="true" />
                  </div>
                  <div
                    className="
                      mb-1 text-3xl font-bold text-foreground
                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    {stats.organizations.toLocaleString()}
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Organizations
                  </div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div
                    className="
                      mx-auto mb-4 inline-flex size-12 items-center
                      justify-center rounded-xl bg-primary/10 text-primary
                    "
                  >
                    <Target className="size-6" aria-hidden="true" />
                  </div>
                  <div
                    className="
                      mb-1 text-3xl font-bold text-foreground
                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    {stats.deals.toLocaleString()}
                  </div>
                  <div className="font-medium text-muted-foreground">Deals</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div
                    className="
                      mx-auto mb-4 inline-flex size-12 items-center
                      justify-center rounded-xl bg-primary/10 text-primary
                    "
                  >
                    <Activity className="size-6" aria-hidden="true" />
                  </div>
                  <div
                    className="
                      mb-1 text-3xl font-bold text-foreground
                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    {stats.activities.toLocaleString()}
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Activities
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="
            py-20
            sm:py-28
            lg:py-32
          "
          aria-labelledby="cta-heading"
        >
          <div
            className="
              mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
          >
            <div
              className="
                relative overflow-hidden rounded-2xl bg-primary p-8 text-center
                sm:p-12
                lg:p-16
              "
            >
              <div
                className="
                  absolute inset-0
                  bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]
                  from-primary/20 via-transparent to-transparent
                "
              />
              <div className="relative z-10 mx-auto max-w-2xl">
                <h2
                  id="cta-heading"
                  className="
                    mb-4 text-3xl font-bold text-primary-foreground
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Ready to close more deals?
                </h2>
                <p className="mb-8 text-lg text-primary-foreground/80 sm:text-xl">
                  Manage contacts, track deals, and automate your sales
                  pipeline. Built for teams who want to focus on selling, not
                  software.
                </p>
                <div
                  className="
                    flex flex-col items-center justify-center gap-4
                    sm:flex-row
                  "
                >
                  <Button
                    size="lg"
                    className="
                      w-full gap-2 bg-primary-foreground text-primary
                      hover:bg-primary-foreground/90
                      sm:w-auto
                    "
                    onClick={openRegister}
                  >
                    Get Started Free
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="
                      w-full gap-2
                      sm:w-auto
                    "
                    onClick={openSignIn}
                  >
                    Sign In
                  </Button>
                </div>
                <p className="mt-4 text-sm text-primary-foreground/60">
                  Completely free · No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30" role="contentinfo">
        <div
          className="
            mx-auto max-w-7xl px-4 py-12
            sm:px-6
            lg:px-8 lg:py-16
          "
        >
          <div
            className="
              mb-12 grid grid-cols-2 gap-8
              md:grid-cols-4
              lg:grid-cols-5
            "
          >
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="mb-4 flex items-center gap-2"
                aria-label="CRM Home"
              >
                <div
                  className="
                    flex size-8 items-center justify-center rounded-lg
                    bg-primary text-primary-foreground
                  "
                >
                  <Target className="size-5" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold">CRM</span>
              </Link>
              <p className="max-w-xs text-sm text-muted-foreground">
                The modern CRM for teams who want to close more deals. Simple,
                powerful, and built for sales.
              </p>
            </div>
            <nav aria-label="Product">
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#integrations"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Roadmap
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="Resources">
              <h3 className="mb-4 font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    API Reference
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="Company">
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="Legal">
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="
                      transition-colors
                      hover:text-foreground
                    "
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <Separator className="mb-8" />
          <div
            className="
              flex flex-col items-center justify-between gap-4
              md:flex-row
            "
          >
            <p className="text-sm text-muted-foreground">
              © 2026 CRM. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/maclenjack/CRM"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-muted-foreground transition-colors
                  hover:text-foreground
                "
                aria-label="GitHub"
              >
                <svg
                  className="size-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/jack-maclennan/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-muted-foreground transition-colors
                  hover:text-foreground
                "
                aria-label="LinkedIn"
              >
                <svg
                  className="size-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
