import type { Metadata } from 'next';

import { SignInForm } from '@/features/auth/components/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In - CRM',
  description: 'Sign in to your CRM workspace',
  robots: 'noindex',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <SignInForm />
    </div>
  );
}
