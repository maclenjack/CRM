import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { HeroPage } from '@/components/HeroPage';
import { AuthModalsProvider } from '@/features/auth/components/AuthModals';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'CRM - Free Customer Relationship Management',
  description:
    'Manage contacts, track deals, and automate your sales pipeline. A free CRM built for teams who want to focus on selling, not software.',
  keywords: [
    'CRM',
    'customer relationship management',
    'sales pipeline',
    'contact management',
    'deal tracking',
    'free CRM',
    'Pipedrive import',
  ],
  authors: [{ name: 'CRM Team' }],
  creator: 'CRM',
  publisher: 'CRM',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crm.app',
    title: 'CRM - Free Customer Relationship Management',
    description:
      'Manage contacts, track deals, and automate your sales pipeline. A free CRM built for teams who want to focus on selling, not software.',
    siteName: 'CRM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRM - Free Customer Relationship Management',
    description:
      'Manage contacts, track deals, and automate your sales pipeline. A free CRM built for teams who want to focus on selling, not software.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default async function Page() {
  const session = await auth();

  if (session) {
    return redirect('/dashboard');
  }

  const [contacts, organizations, deals, activities] = await Promise.all([
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.deal.count({ where: { deletedAt: null } }),
    prisma.activity.count({ where: { deletedAt: null } }),
  ]);

  return (
    <AuthModalsProvider>
      <HeroPage
        stats={{
          contacts,
          organizations,
          deals,
          activities,
        }}
      />
    </AuthModalsProvider>
  );
}
