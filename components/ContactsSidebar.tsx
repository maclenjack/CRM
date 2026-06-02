import { NavLink } from '@/components/NavLink';

export function ContactsSidebar() {
  return (
    <aside
      className="
        flex h-screen w-64 flex-col border-r border-neutral-200 bg-neutral-50
      "
    >
      <div className="flex items-center p-4">
        <span className="text-2xl font-semibold text-primary-600">
          Contacts
        </span>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-2">
        <NavLink href="/contacts/people">People</NavLink>
        <NavLink href="/contacts/organizations">Organizations</NavLink>
        <NavLink href="/contacts/timeline">Timeline</NavLink>
        <NavLink href="/contacts/merge">Merge Duplicates</NavLink>
      </nav>
      <div className="p-4">
        <div className="text-sm text-neutral-500">User • john@example.com</div>
      </div>
    </aside>
  );
}
