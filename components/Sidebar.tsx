import {
  BriefcaseIcon,
  CalendarIcon,
  HomeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import { NavLink } from '@/components';

export function Sidebar() {
  return (
    <aside
      className="
        group flex h-screen w-16 flex-col overflow-hidden border-r
        border-neutral-200 bg-neutral-900 transition-all duration-300
        ease-in-out
        hover:w-64
      "
    >
      <div
        className="
          flex w-full items-center px-1 py-4 transition-all duration-300
          ease-in-out
          group-hover:px-4
        "
      >
        <span className="text-2xl font-semibold text-primary-500">CRM</span>
      </div>
      <nav className="flex-1 space-y-10 px-4 py-2">
        <NavLink href="/dashboard">
          <HomeIcon className="size-6 shrink-0" />
          <span
            className="
              ml-2 opacity-0 transition-opacity
              group-hover:opacity-100
            "
          >
            Dashboard
          </span>
        </NavLink>
        <NavLink href="/activities">
          <CalendarIcon className="size-6 shrink-0" />
          <span
            className="
              ml-2 opacity-0 transition-opacity
              group-hover:opacity-100
            "
          >
            Activities
          </span>
        </NavLink>
        <NavLink href="/contacts">
          <UserIcon className="size-6 shrink-0" />
          <span
            className="
              ml-2 opacity-0 transition-opacity
              group-hover:opacity-100
            "
          >
            Contacts
          </span>
        </NavLink>
        <NavLink href="/deals">
          <BriefcaseIcon className="size-6 shrink-0" />
          <span
            className="
              ml-2 opacity-0 transition-opacity
              group-hover:opacity-100
            "
          >
            Deals
          </span>
        </NavLink>
      </nav>
      <div className="flex h-10 items-center overflow-hidden px-4">
        <NavLink href="/user">
          <UserIcon className="size-6 shrink-0" />
          <div
            className="
              ml-2 text-nowrap opacity-0 transition-opacity
              group-hover:opacity-100
            "
          >
            User • john@example.com
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
