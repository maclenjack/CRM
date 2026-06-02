'use client';

import { useRouter } from 'next/navigation';
import { SubmitEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-sm space-y-4 rounded-lg border border-neutral-200
          bg-white p-8 shadow-md
        "
      >
        <h2 className="text-center text-2xl font-semibold text-neutral-900">
          Login
        </h2>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-neutral-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="
              mt-1 block w-full rounded-md border border-neutral-300 bg-white
              px-3 py-2 text-neutral-900 shadow-sm
              focus:border-primary-500 focus:ring-primary-500
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
          <input
            type="password"
            id="password"
            name="password"
            required
            className="
              mt-1 block w-full rounded-md border border-neutral-300 bg-white
              px-3 py-2 text-neutral-900 shadow-sm
              focus:border-primary-500 focus:ring-primary-500
            "
          />
        </div>
        <button
          type="submit"
          className="
            w-full rounded-md bg-primary-600 py-2 text-white
            hover:bg-primary-700
          "
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
