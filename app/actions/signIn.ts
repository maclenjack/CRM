'use server';

import { AuthError } from 'next-auth';

import z from 'zod';

import { signIn as nextAuthSignIn } from '@/auth';
import { signInSchema } from '@/schemas/user.schema';

export async function signIn(data: z.infer<typeof signInSchema>) {
  try {
    const { email, password } = data;

    await nextAuthSignIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return { error: 'Invalid email or password credentials.' };
      }
      return { error: 'An authentication error occurred.' };
    }
    throw error;
  }
}
