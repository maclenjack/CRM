import type { Metadata } from 'next';

import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Register - CRM',
  description: 'Create a new CRM account',
  robots: 'noindex',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <RegisterForm />
    </div>
  );
}
