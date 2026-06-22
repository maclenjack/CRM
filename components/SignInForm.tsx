'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import NextAuthSignInAction from '@/app/(auth)/sign_in/action';
import { devLog } from '@/utils/logger';

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await NextAuthSignInAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (_error) {
      setError('An unexpected error occurred.');
      devLog(_error);
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
        Sign In
      </h2>

      {error && (
        <div className="rounded-sm bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            focus:border-primary focus:ring-primary
          "
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            required
            className="
              mt-1 block w-full rounded-md border border-neutral-300 bg-white
              px-3 py-2 text-neutral-900 shadow-sm
              focus:border-primary focus:ring-primary
            "
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="
              absolute inset-y-0 right-3 flex items-center text-gray-600
            "
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-md bg-primary-600 py-2 text-white
          hover:bg-primary-700
        "
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="
            text-primary-600
            hover:underline
          "
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
