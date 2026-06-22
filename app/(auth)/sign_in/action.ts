'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/auth';

export default async function NextAuthSignInAction(formData: FormData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');

    await signIn('credentials', {
      email,
      password,
      redirect: false,
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
