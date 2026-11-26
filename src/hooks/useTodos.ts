import { useState, useEffect, useCallback, useRef } from 'react';
import { TodoItem, DeletedTodoHistory } from '../types/todo';
import { loadTodosFromStorage, saveTodosToStorage } from '../lib/storage';

export function useTodos() {
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState<DeletedTodoHistory | null>(null);
  const [storageError, setStorageError] = useState<'save_failed' | 'corrupted' | 'unsupported_version' | null>(null);

  // 초기 로드 시 1회만 localStorage 로드
  useEffect(() => {
    const result = loadTodosFromStorage();
    if (result.success) {
      setTasks(result.tasks);
      setStorageError(null);
    } else {
      if (result.error === 'corrupted') {
        setStorageError('corrupted');
      } else if (result.error === 'unsupported_version') {
        setStorageError('unsupported_version');
      } else {
        setStorageError('save_failed');
      }
    }
    setIsLoaded(true);
  }, []);

  // tasks 상태가 변할 때마다 localStorage에 자동 저장 (단, 초기 로드가 완료된 후에만)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isLoaded) return;

    // 만약 초기 로드 시 원본 데이터 손상 또는 알 수 없는 상위 버전 오류 상태라면 자동 덮어쓰기 금지!
    if (storageError === 'corrupted' || storageError === 'unsupported_version') {
      return;
    }

    const success = saveTodosToStorage(tasks);
    if (!success) {
      setStorageError('save_failed');
    } else {
      // 이전에 저장 실패 상태였다면 성공 시 해제
      setStorageError((prev) => (prev === 'save_failed' ? null : prev));
    }
  }, [tasks, isLoaded, storageError]);

  /**
   * 할 일 추가
   */
  const addTodo = useCallback((rawText: string): { success: boolean; error?: string; task?: TodoItem } => {
    const text = rawText.trim();
    if (!text) {
      return { success: false, error: '할 일을 입력해 주세요.' };
    }
    if (text.length > 200) {
      return { success: false, error: '할 일은 최대 200자까지 입력할 수 있습니다.' };
    }

    const now = new Date().toISOString();
    const newTask: TodoItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `todo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [newTask, ...prev]);
    return { success: true, task: newTask };
  }, []);

  /**
   * 완료 여부 토글
   */
  const toggleTodo = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  /**
   * 내용 수정
   */
  const editTodo = useCallback((id: string, rawText: string): boolean => {
    const text = rawText.trim();
    if (!text || text.length > 200) {
      return false;
    }

    setTasks((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, text, updatedAt: new Date().toISOString() }
          : item
      )
    );
    return true;
  }, []);

  /**
   * 개별 삭제 및 실행 취소 히스토리 보관 (최신 1건)
   */
  const deleteTodo = useCallback((id: string): { success: boolean; deletedTask?: TodoItem } => {
    let removedTask: TodoItem | undefined;
    let originalIndex = -1;

    setTasks((prev) => {
      originalIndex = prev.findIndex((item) => item.id === id);
      if (originalIndex === -1) return prev;
      removedTask = prev[originalIndex];
      return prev.filter((item) => item.id !== id);
    });

    if (removedTask && originalIndex !== -1) {
      setDeletedHistory({
        task: removedTask,
        originalIndex,
      });
      return { success: true, deletedTask: removedTask };
    }
    return { success: false };
  }, []);

  /**
   * 삭제 실행 취소 (원래 위치에 복원)
   */
  const undoDelete = useCallback((): { success: boolean; restoredTask?: TodoItem } => {
    if (!deletedHistory) return { success: false };

    const { task, originalIndex } = deletedHistory;
    setTasks((prev) => {
      // 이미 존재하는 ID 방지
      if (prev.some((item) => item.id === task.id)) return prev;

      const newTasks = [...prev];
      const insertIndex = Math.min(Math.max(0, originalIndex), newTasks.length);
      newTasks.splice(insertIndex, 0, task);
      return newTasks;
    });

    setDeletedHistory(null);
    return { success: true, restoredTask: task };
  }, [deletedHistory]);

  /**
   * 실행 취소 알림 닫기
   */
  const dismissUndo = useCallback(() => {
    setDeletedHistory(null);
  }, []);

  /**
   * 완료 항목 일괄 삭제
   */
  const clearCompleted = useCallback((): number => {
    let count = 0;
    setTasks((prev) => {
      const remaining = prev.filter((item) => {
        if (item.completed) {
          count++;
          return false;
        }
        return true;
      });
      return remaining;
    });
    return count;
  }, []);

  /**
   * 저장 실패 시 재시도
   */
  const retrySave = useCallback(() => {
    const success = saveTodosToStorage(tasks);
    if (success) {
      setStorageError(null);
    } else {
      setStorageError('save_failed');
    }
  }, [tasks]);

  /**
   * 손상된 스토리지 사용자 승인 후 초기화
   */
  const resetCorruptedStorage = useCallback(() => {
    setTasks([]);
    saveTodosToStorage([]);
    setStorageError(null);
  }, []);

  return {
    tasks,
    isLoaded,
    deletedHistory,
    storageError,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    undoDelete,
    dismissUndo,
    clearCompleted,
    retrySave,
    resetCorruptedStorage,
  };
}
