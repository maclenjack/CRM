'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { devLog } from '@/utils/logger';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create account.');
      } else {
        router.push('/sign_in?registered=true');
      }
    } catch (error) {
      setError('Failed to connect to registration servers.');
      devLog(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white
        p-8 shadow-md
      "
    >
      <h2 className="text-center text-2xl font-semibold text-neutral-900">
        Create Account
      </h2>
      {error && (
        <div className="rounded-sm bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-neutral-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="
            mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3
            py-2 text-neutral-900 shadow-sm
            focus:border-primary-500 focus:ring-primary-500
          "
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-700"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="
            mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3
            py-2 text-neutral-900 shadow-sm
            focus:border-primary-500 focus:ring-primary-500
          "
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-700"
        >
          Password (Min 8 chars)
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          className="
            mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3
            py-2 text-neutral-900 shadow-sm
            focus:border-primary-500 focus:ring-primary-500
          "
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-md bg-primary-600 py-2 text-white
          hover:bg-primary-700
        "
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>

      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link
          href="/sign_in"
          className="
            text-primary-600
            hover:underline
          "
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
