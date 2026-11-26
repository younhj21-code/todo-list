export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface TodoStorageData {
  schemaVersion: number;
  tasks: TodoItem[];
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface DeletedTodoHistory {
  task: TodoItem;
  originalIndex: number;
}
