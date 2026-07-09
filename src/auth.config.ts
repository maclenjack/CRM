import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log(auth);
      const isLoggedIn = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname === '/sign-in' || nextUrl.pathname === '/register';

      if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL('/sign-in', nextUrl));
      }

      if (isLoggedIn && isPublicRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
