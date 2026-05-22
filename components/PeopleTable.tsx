import { ReactNode } from 'react';

export interface PeopleTableProps {
  children?: ReactNode;
}

export function PeopleTable({ children }: PeopleTableProps) {
  return <div className="overflow-x-auto">{children}</div>;
}
