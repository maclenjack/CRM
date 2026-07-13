'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { clsx } from 'clsx';
import {
  Building2Icon,
  CalendarDays,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const isContactsActive = pathname.startsWith('/contacts');

  const [isContactsOpen, setIsContactsOpen] = useState(isContactsActive);

  useEffect(() => {
    setIsContactsOpen(isContactsActive);
  }, [pathname, isContactsActive]);

  return (
    <Sidebar className="border-r border-border/50 bg-muted/30">
      <SidebarHeader
        className="
          flex h-14 flex-row items-center gap-2.5 border-b border-border/40 px-6
        "
      >
        <div
          className="
            flex size-6 shrink-0 items-center justify-center rounded-md
            bg-secondary text-xs font-black text-secondary-foreground shadow-xs
          "
        >
          ●
        </div>
        <span
          className="
            text-base font-bold tracking-tight text-foreground select-none
          "
        >
          CRM
        </span>
      </SidebarHeader>

      <SidebarContent className="space-y-6 p-4">
        <div>
          <span
            className="
              mb-2 block px-3 text-[10px] font-bold tracking-wider
              text-muted-foreground/60 uppercase select-none
            "
          >
            Navigation Links
          </span>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                className={clsx(
                  'w-full transition-all duration-200',
                  pathname === '/dashboard' &&
                    `
                      bg-secondary/15 font-semibold text-secondary
                      hover:bg-secondary/20
                    `
                )}
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4.5 shrink-0" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/activities'}
                className={clsx(
                  'w-full transition-all duration-200',
                  pathname === '/activities' &&
                    `
                      bg-secondary/15 font-semibold text-secondary
                      hover:bg-secondary/20
                    `
                )}
              >
                <Link href="/activities">
                  <CalendarDays className="size-4.5 shrink-0" />
                  <span>Activities</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Collapsible
              open={isContactsOpen}
              onOpenChange={setIsContactsOpen}
              className="group/collapsible w-full"
            >
              <SidebarMenuItem className="relative">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/contacts'}
                  className={clsx(
                    'w-full pr-10 transition-all duration-200',
                    pathname === '/contacts' &&
                      `
                        bg-secondary/15 font-semibold text-secondary
                        hover:bg-secondary/20
                      `,
                    pathname !== '/contacts' &&
                      isContactsActive &&
                      'bg-transparent font-semibold text-secondary'
                  )}
                >
                  <Link href="/contacts">
                    <UsersIcon className="size-4.5 shrink-0" />
                    <span>Contacts</span>
                  </Link>
                </SidebarMenuButton>

                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    className="
                      right-3 flex size-6 cursor-pointer items-center
                      justify-center p-0 text-muted-foreground/50 transition-all
                      duration-200
                      group-data-[state=open]/collapsible:rotate-90
                      hover:text-foreground
                      data-[state=open]:bg-transparent
                    "
                  >
                    <ChevronRight className="size-4" />
                  </SidebarMenuAction>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub
                    className="
                      mt-1 ml-5 space-y-0.5 border-l border-border/70 pl-2
                    "
                  >
                    <SidebarMenuSubItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === '/contacts/people'}
                        className={clsx(
                          `
                            h-8 w-full gap-2.5 rounded-lg px-3 text-sm
                            transition-all duration-200
                          `,
                          pathname === '/contacts/people'
                            ? `
                              bg-secondary/15 font-semibold text-secondary
                              hover:bg-secondary/20
                            `
                            : `
                              text-muted-foreground
                              hover:text-foreground
                            `
                        )}
                      >
                        <Link href="/contacts/people">
                          <UserIcon className="size-4 shrink-0 opacity-80" />
                          <span>People</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === '/contacts/organizations'}
                        className={clsx(
                          `
                            h-8 w-full gap-2.5 rounded-lg px-3 text-sm
                            transition-all duration-200
                          `,
                          pathname === '/contacts/organizations'
                            ? `
                              bg-secondary/15 font-semibold text-secondary
                              hover:bg-secondary/20
                            `
                            : `
                              text-muted-foreground
                              hover:text-foreground
                            `
                        )}
                      >
                        <Link href="/contacts/organizations">
                          <Building2Icon className="size-4 shrink-0 opacity-80" />
                          <span>Organizations</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/deals'}
                className={clsx(
                  'w-full transition-all duration-200',
                  pathname === '/deals' &&
                    `
                      bg-secondary/15 font-semibold text-secondary
                      hover:bg-secondary/20
                    `
                )}
              >
                <Link href="/deals">
                  <FolderKanban className="size-4.5 shrink-0" />
                  <span>Deals</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter
        className="
          flex h-16 flex-row items-center gap-3 border-t border-border/40 px-4
        "
      >
        <Avatar className="size-9 border border-border/50">
          <AvatarFallback className="bg-secondary/10 text-xs font-semibold text-secondary">
            JM
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col select-none">
          <span className="truncate text-sm/tight font-semibold text-foreground">
            Jack Maclennan
          </span>
          <span
            className="
              mt-0.5 truncate text-xs leading-none text-muted-foreground/80
            "
          >
            jackwmaclennan@gmail.com
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
