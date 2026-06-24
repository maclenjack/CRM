import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

import { AppSidebar } from '@/components/AppSidebar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-screen! w-full"
      >
        <ResizablePanel
          defaultSize={200}
          minSize={130}
          maxSize={300}
          className="
            hidden
            md:block
          "
        >
          <SessionProvider>
            <AppSidebar />
          </SessionProvider>
        </ResizablePanel>
        {/* <ResizableHandle withHandle /> */}
        <ResizableHandle />
        <ResizablePanel>
          <main className="h-full overflow-y-auto p-6">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarProvider>
  );
}
