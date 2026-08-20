'use server';

import { AuthError } from 'next-auth';

import argon2 from 'argon2';
import { z } from 'zod';

import { signIn as nextAuthSignIn } from '@/auth';
import { registerSchema, signInSchema } from '@/features/auth/auth.validation';
import prisma from '@/lib/prisma';

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Validation failed',
      details: z.treeifyError(validatedFields.error),
    };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: passwordHash,
        role: 'USER',
      },
    });
  } catch (error) {
    console.log(error);
    return { error: 'Something went wrong during account creation.' };
  }

  const loginResult = await signIn({ email, password });

  if (loginResult?.error) {
    return { error: loginResult.error };
  }

  return { success: true };
}

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
