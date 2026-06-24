'use server';

import argon2 from 'argon2';
import { z } from 'zod';

import { signIn } from '@/app/actions/signIn';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/schemas/user.schema';

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
        role: 'user',
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
