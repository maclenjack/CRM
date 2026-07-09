export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  className?: string;
  formatter?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
}
