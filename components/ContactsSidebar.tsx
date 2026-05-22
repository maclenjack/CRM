import { NavLink } from '@/components/NavLink';

export function ContactsSidebar() {
  return (
    <aside
      className="
        flex h-screen w-64 flex-col border-r border-border bg-background
      "
    >
      <div className="flex items-center p-4">
        <span className="text-2xl font-semibold text-primary">Contacts</span>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-2">
        <NavLink href="/contacts/people" active={false}>
          People
        </NavLink>
        <NavLink href="/contacts/organizations" active={false}>
          Organizations
        </NavLink>
        <NavLink href="/contacts/timeline" active={false}>
          Timeline
        </NavLink>
        <NavLink href="/contacts/merge" active={false}>
          Merge Duplicates
        </NavLink>
      </nav>
      <div className="p-4">
        <div className="text-sm text-secondary">User • john@example.com</div>
      </div>
    </aside>
  );
}
