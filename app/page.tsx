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
    <div
      className="
        flex min-h-screen items-center justify-center bg-gray-50
        dark:bg-gray-900
      "
    >
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-md
          dark:bg-gray-800
        "
      >
        <h2
          className="
            text-center text-2xl font-semibold text-gray-900
            dark:text-white
          "
        >
          Login
        </h2>
        <div>
          <label
            htmlFor="username"
            className="
              block text-sm font-medium text-gray-700
              dark:text-gray-300
            "
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="
              mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2
              text-gray-900 shadow-sm
              focus:border-indigo-500 focus:ring-indigo-500
              dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200
            "
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="
              block text-sm font-medium text-gray-700
              dark:text-gray-300
            "
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="
              mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2
              text-gray-900 shadow-sm
              focus:border-indigo-500 focus:ring-indigo-500
              dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200
            "
          />
        </div>
        <button
          type="submit"
          className="
            w-full rounded-md bg-indigo-600 py-2 text-white
            hover:bg-indigo-700
          "
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
