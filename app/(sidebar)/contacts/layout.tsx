import { ReactNode } from 'react';

import { ContactsSidebar } from '@/components';

export default function ContactsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ContactsSidebar />
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  );
}
