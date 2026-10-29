import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';

import { auth } from '@/auth';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <SessionProvider session={session}>
      <SidebarProvider
        defaultOpen={true}
        style={
          {
            '--sidebar-width': '260px',
            '--sidebar-width-icon': '68px',
          } as React.CSSProperties
        }
      >
        <div
          className="
            flex h-screen w-screen overflow-hidden bg-background
            selection:bg-secondary/20
          "
        >
          <AppSidebar />

          <SidebarInset className="flex h-screen flex-col overflow-hidden bg-background">
            <header
              className="
                z-10 flex h-14 shrink-0 items-center gap-3 border-b
                border-border/40 bg-background/50 px-4 backdrop-blur-md
              "
            >
              <SidebarTrigger
                className="
                  cursor-pointer text-muted-foreground/80 transition-colors
                  hover:text-foreground
                "
              />
              <Separator orientation="vertical" className="h-4 bg-border/60" />
              <div
                className="
                  flex items-center gap-2 text-xs font-medium
                  text-muted-foreground select-none
                "
              >
                <span className="text-sm font-semibold text-foreground/90">
                  CRM Platform
                </span>
              </div>
            </header>

            <div
              className="
                flex-1 overflow-y-auto bg-background
                focus-visible:outline-none
              "
            >
              <div className="size-full">{children}</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
