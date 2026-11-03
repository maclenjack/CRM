import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'CRM - Sign In',
  description: 'Sign in to your CRM workspace',
  robots: 'noindex',
};

export default async function Page() {
  const session = await auth();

  if (!session) {
    return redirect('/sign-in');
  }

  return redirect('/dashboard');
}
