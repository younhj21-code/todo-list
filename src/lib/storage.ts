import { TodoItem, TodoStorageData } from '../types/todo';

export const STORAGE_KEY = 'todo-app:v1';
export const CURRENT_SCHEMA_VERSION = 1;

export type LoadStorageResult =
  | { success: true; tasks: TodoItem[] }
  | { success: false; error: 'corrupted' | 'unsupported_version' | 'read_error'; rawData?: string };

/**
 * 개별 TodoItem의 구조 및 유효성을 검사합니다.
 */
function isValidTodoItem(item: unknown): item is TodoItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<TodoItem>;

  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') return false;
  if (typeof candidate.text !== 'string') return false;
  if (typeof candidate.completed !== 'boolean') return false;
  if (typeof candidate.createdAt !== 'string' || Number.isNaN(Date.parse(candidate.createdAt))) return false;
  if (typeof candidate.updatedAt !== 'string' || Number.isNaN(Date.parse(candidate.updatedAt))) return false;

  return true;
}

/**
 * localStorage에서 할 일 목록을 불러오고 유효성을 검증합니다.
 */
export function loadTodosFromStorage(): LoadStorageResult {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { success: false, error: 'read_error' };
  }

  // 저장된 데이터가 없는 초기 상태는 성공으로 처리 (빈 목록)
  if (raw === null) {
    return { success: true, tasks: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'corrupted', rawData: raw };
    }

    const { schemaVersion, tasks } = parsed as Partial<TodoStorageData>;

    if (typeof schemaVersion !== 'number') {
      return { success: false, error: 'corrupted', rawData: raw };
    }

    // 상위 버전 스키마인 경우 임의 변환 금지
    if (schemaVersion > CURRENT_SCHEMA_VERSION) {
      return { success: false, error: 'unsupported_version', rawData: raw };
    }

    if (!Array.isArray(tasks)) {
      return { success: false, error: 'corrupted', rawData: raw };
    }

    const idSet = new Set<string>();
    const validatedTasks: TodoItem[] = [];

    for (const item of tasks) {
      if (!isValidTodoItem(item)) {
        return { success: false, error: 'corrupted', rawData: raw };
      }
      if (idSet.has(item.id)) {
        // 중복 ID 검출
        return { success: false, error: 'corrupted', rawData: raw };
      }
      idSet.add(item.id);
      validatedTasks.push(item);
    }

    // createdAt 내림차순 정렬 보장
    validatedTasks.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return { success: true, tasks: validatedTasks };
  } catch {
    return { success: false, error: 'corrupted', rawData: raw };
  }
}

/**
 * 할 일 목록을 localStorage에 저장합니다.
 * 실패 시 boolean false를 반환하여 호출 측에서 저장 실패 상태를 알 수 있도록 합니다.
 */
export function saveTodosToStorage(tasks: TodoItem[]): boolean {
  try {
    const data: TodoStorageData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
