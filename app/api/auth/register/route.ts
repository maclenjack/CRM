import { NextResponse } from 'next/server';

import argon2 from 'argon2';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: passwordHash,
        role: 'user',
      },
    });

    return NextResponse.json(
      { success: true, message: 'User account registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Critical breakdown inside register pipeline:', error);
    return NextResponse.json(
      { error: 'Internal server processing error occurred' },
      { status: 500 }
    );
  }
}
