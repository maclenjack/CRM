import { LogOut, Mail, User } from 'lucide-react';

import { auth, signOut } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function UserPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div
      className="
        min-h-screen bg-background text-foreground transition-colors
        duration-200
      "
    >
      <div className="mx-auto w-full max-w-2xl space-y-8 px-6 py-10">
        <div className="space-y-2 border-b border-border pb-6">
          <h1
            className="
              text-3xl font-bold tracking-tight
              sm:text-4xl
            "
          >
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your public profile information and system authentication
            credentials.
          </p>
        </div>

        <Card className="overflow-hidden bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 bg-accent/5 py-6">
            <div
              className="
                flex flex-col items-center gap-4
                sm:flex-row
              "
            >
              <Avatar className="size-16 border-2 border-border shadow-sm">
                {user.image && (
                  <AvatarImage
                    src={user.image}
                    alt={user.name ?? 'User profile picture'}
                  />
                )}
                <AvatarFallback className="bg-secondary/10 text-lg font-bold text-secondary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className="
                  space-y-1 text-center
                  sm:text-left
                "
              >
                <CardTitle className="text-xl">
                  {user.name ?? 'User Account'}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div
              className="
                grid grid-cols-1 gap-4
                md:grid-cols-2
              "
            >
              <div
                className="
                  flex items-center gap-3 rounded-lg border border-border/60
                  bg-background/50 p-3
                "
              >
                <User className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p
                    className="
                      text-[10px] font-bold tracking-wider
                      text-muted-foreground/80 uppercase
                    "
                  >
                    Full Name
                  </p>
                  <p className="truncate text-sm font-medium">
                    {user.name ?? 'N/A'}
                  </p>
                </div>
              </div>

              <div
                className="
                  flex items-center gap-3 rounded-lg border border-border/60
                  bg-background/50 p-3
                "
              >
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p
                    className="
                      text-[10px] font-bold tracking-wider
                      text-muted-foreground/80 uppercase
                    "
                  >
                    Email Address
                  </p>
                  <p className="truncate text-sm font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            <div
              className="
                flex flex-col border-t border-border/50 pt-4
                sm:flex-row sm:justify-end
              "
            >
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/sign-in' });
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  className="
                    flex w-full cursor-pointer items-center gap-2 px-5
                    sm:w-auto
                  "
                >
                  <LogOut className="size-4" />
                  Sign Out of CRM
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
