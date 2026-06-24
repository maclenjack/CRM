'use client';

import { useSession } from 'next-auth/react';

import { Briefcase, Calendar, Home, User } from 'lucide-react';

import { ContactsButton } from '@/components/ContactsButton';
import { SidebarLink } from '@/components/SidebarLink';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { data } = useSession();
  return (
    <Sidebar
      collapsible="none"
      className="h-full w-full! border-r-0 bg-sidebar"
    >
      <SidebarHeader>
        <SidebarGroup>
          <div className="text-2xl font-semibold text-primary">CRM</div>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Links</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <Home className="size-5" /> Dashboard
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                href="/activities"
                className="flex items-center gap-2"
              >
                <Calendar className="size-5" /> Activities
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ContactsButton />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink href="/deals" className="flex items-center gap-2">
                <Briefcase className="size-5" /> Deals
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarMenuButton className="w-full">
            <SidebarLink
              href="/user"
              className="flex items-center justify-end gap-2 p-4"
            >
              <User className="size-6 shrink-0" />
              <span className="shrink-0">
                {data?.user.name || data?.user.email}
              </span>
            </SidebarLink>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
