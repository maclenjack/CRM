import type { Account, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import argon2 from 'argon2';

import { handlers } from '@/auth';
import prisma from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // TODO: Third party credential providers
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Partial<Record<'email' | 'password', unknown>>
      ) {
        try {
          if (
            typeof credentials.email !== 'string' ||
            typeof credentials.password !== 'string'
          ) {
            return null;
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.hashedPassword) return null;
          const isValidPassword = await argon2.verify(
            user.hashedPassword,
            credentials.password
          );
          if (!isValidPassword) return null;
          return user;
        } catch (err) {
          console.error('Auth error', err);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt(params: { token: JWT; account?: Account }) {
      const { token, account } = params;
      if (account) token.accessToken = account.access_token as string;
      return token;
    },
    async session(params: {
      session: Session & { user: { id?: string; accessToken?: string } };
      token: JWT;
    }) {
      const { session, token } = params;
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub ?? '',
          accessToken: token.accessToken ?? '',
        };
      }

      return session;
    },
  },
};

export const GET = handlers.GET;
export const POST = handlers.POST;
