import { usePathname } from 'next/dist/client/components/navigation';
import { useState } from 'react';

import { Briefcase, User, Users } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

import { SidebarLink } from '@/components/SidebarLink';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function ContactsButton() {
  const pathname = usePathname();
  const active = pathname.includes('/contacts');
  const [open, setOpen] = useState(active);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setOpen(active);
    setPrevPathname(pathname);
  }

  return (
    <Collapsible
      className="group/collapsible"
      open={open}
      onOpenChange={() => setOpen((prev) => !prev)}
    >
      <SidebarLink href="/contacts" className="flex w-full items-center">
        <span className="flex grow items-center gap-2">
          <Users className="size-5" /> Contacts
        </span>
        <CollapsibleTrigger
          onClick={(e) => {
            // ⚠️ THE FIX: Prevents the Link from routing and intercepting the click
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <ChevronDown
            className="
              ml-auto cursor-pointer transition-transform
              group-data-[state=open]/collapsible:rotate-180
            "
          />
        </CollapsibleTrigger>
      </SidebarLink>

      <CollapsibleContent>
        <SidebarMenuButton asChild>
          <SidebarLink
            href="/contacts/people"
            className="flex items-center gap-2 pl-4"
          >
            <User className="size-5" /> People
          </SidebarLink>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <SidebarLink
            href="/contacts/organizations"
            className="flex items-center gap-2 pl-4"
          >
            <Briefcase className="size-5" /> Organizations
          </SidebarLink>
        </SidebarMenuButton>
      </CollapsibleContent>
    </Collapsible>
  );
}
