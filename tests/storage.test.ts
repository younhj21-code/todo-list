import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  loadTodosFromStorage,
  saveTodosToStorage,
} from '../src/lib/storage';
import { TodoItem } from '../src/types/todo';

describe('Storage 단위 테스트 (src/lib/storage.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('초기 스토리지에 데이터가 없으면 빈 배열과 성공을 반환한다', () => {
    const result = loadTodosFromStorage();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tasks).toEqual([]);
    }
  });

  it('정상적인 TodoItem 데이터를 저장하고 불러올 수 있다', () => {
    const mockTasks: TodoItem[] = [
      {
        id: 'task-1',
        text: '첫 번째 할 일',
        completed: false,
        createdAt: '2026-11-26T10:00:00.000Z',
        updatedAt: '2026-11-26T10:00:00.000Z',
      },
      {
        id: 'task-2',
        text: '두 번째 할 일',
        completed: true,
        createdAt: '2026-11-26T10:05:00.000Z',
        updatedAt: '2026-11-26T10:05:00.000Z',
      },
    ];

    const saveSuccess = saveTodosToStorage(mockTasks);
    expect(saveSuccess).toBe(true);

    const result = loadTodosFromStorage();
    expect(result.success).toBe(true);
    if (result.success) {
      // createdAt 내림차순 정렬 확인 (task-2가 더 나중 시간이므로 맨 앞)
      expect(result.tasks.length).toBe(2);
      expect(result.tasks[0].id).toBe('task-2');
      expect(result.tasks[1].id).toBe('task-1');
    }
  });

  it('잘못된 JSON 형식이 저장되어 있으면 corrupted 오류를 반환하고 데이터를 덮어쓰지 않는다', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid_json ');

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('corrupted');
      expect(result.rawData).toBe('{ invalid_json ');
    }
  });

  it('스키마 형식이 맞지 않거나 필수 필드가 누락된 경우 corrupted 오류를 반환한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        tasks: [{ id: '', text: 123 }], // 유효하지 않은 항목
      })
    );

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('corrupted');
    }
  });

  it('알 수 없는 상위 스키마 버전의 경우 unsupported_version 오류를 반환한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 99,
        tasks: [],
      })
    );

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('unsupported_version');
    }
  });

  it('localStorage 접근 시 에러가 발생하면 읽기 실패를 안전하게 처리한다', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: Access Denied');
    });

    const result = loadTodosFromStorage();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('read_error');
    }
  });

  it('localStorage 저장 시 에러(QuotaExceeded 등)가 발생하면 false를 반환한다', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const saveSuccess = saveTodosToStorage([]);
    expect(saveSuccess).toBe(false);
  });
});
