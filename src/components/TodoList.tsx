import React, { useRef } from 'react';
import { TodoItem, TodoFilter } from '../types/todo';
import { TodoListItem } from './TodoListItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  tasks: TodoItem[];
  totalCount: number;
  currentFilter: TodoFilter;
  searchQuery: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
  onFocusInput: () => void;
  onClearSearch: () => void;
  onResetFilter: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  totalCount,
  currentFilter,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
  onFocusInput,
  onClearSearch,
  onResetFilter,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  const handleDeleteWithFocus = (id: string) => {
    // 삭제 전 현재 항목의 인덱스 확인
    const index = tasks.findIndex((t) => t.id === id);
    onDelete(id);

    // 삭제 후 포커스 이동: 다음 항목 -> 이전 항목 -> 입력창
    setTimeout(() => {
      if (!listRef.current) return;
      const buttons = listRef.current.querySelectorAll<HTMLButtonElement>('button[title="삭제"]');
      if (buttons.length > 0) {
        // 다음 항목의 삭제 버튼(인덱스 위치 그대로)이 있으면 거기로, 없으면 마지막 항목으로
        const nextButton = buttons[index] || buttons[index - 1] || buttons[buttons.length - 1];
        nextButton?.focus();
      } else {
        // 더 이상 항목이 없으면 입력창으로 이동
        onFocusInput();
      }
    }, 0);
  };

  // 1. 전체 데이터가 비어 있는 경우
  if (totalCount === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>아직 할 일이 없어요</p>
        <button
          type="button"
          className={styles.emptyAction}
          onClick={onFocusInput}
        >
          첫 할 일을 입력해 보세요.
        </button>
      </div>
    );
  }

  // 2. 검색 결과가 없는 경우
  if (searchQuery.trim() !== '' && tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>일치하는 할 일이 없어요</p>
        <p className={styles.emptyDesc}>검색어를 확인하거나 다시 입력해 보세요.</p>
        <button
          type="button"
          className={styles.primaryActionButton}
          onClick={onClearSearch}
        >
          검색어 초기화
        </button>
      </div>
    );
  }

  // 3. 필터 조건에 따른 빈 상태
  if (tasks.length === 0) {
    if (currentFilter === 'active') {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>진행 중인 할 일이 없어요</p>
          <p className={styles.emptyDesc}>모든 할 일을 마쳤거나 새 할 일을 추가할 수 있습니다.</p>
        </div>
      );
    }
    if (currentFilter === 'completed') {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>아직 완료한 할 일이 없어요</p>
          <p className={styles.emptyDesc}>할 일을 완료하면 여기에 표시됩니다.</p>
        </div>
      );
    }
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>이 조건에 맞는 할 일이 없어요</p>
        <button
          type="button"
          className={styles.primaryActionButton}
          onClick={onResetFilter}
        >
          전체 보기
        </button>
      </div>
    );
  }

  return (
    <ul ref={listRef} className={styles.list} aria-label="할 일 목록">
      {tasks.map((item) => (
        <TodoListItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={handleDeleteWithFocus}
        />
      ))}
    </ul>
  );
};
