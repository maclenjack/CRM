import { NavLink } from '@/components/NavLink';

export function Sidebar() {
  return (
    <aside
      className="
        flex h-screen w-64 flex-col border-r border-border bg-background
      "
    >
      <div className="flex items-center p-4">
        <span className="text-2xl font-semibold text-primary">CRM</span>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-2">
        <NavLink href="/activities" active={false}>
          Activities
        </NavLink>
        <NavLink href="/contacts" active={false}>
          Contacts
        </NavLink>
        <NavLink href="/deals" active={false}>
          Deals
        </NavLink>
      </nav>
      <div className="p-4">
        <div className="text-sm text-secondary">User • john@example.com</div>
      </div>
    </aside>
  );
}
