export interface KanbanColumnData {
  id: string;
  title: string;
}

export interface KanbanCardData {
  id: string;
  columnId: string;
  position: number;
  [key: string]: any;
}
