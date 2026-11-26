import React, { useState, useMemo, useRef } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoFilter } from './types/todo';
import { Header } from './components/Header';
import { TodoInput, TodoInputHandle } from './components/TodoInput';
import { FilterSearch } from './components/FilterSearch';
import { TodoList } from './components/TodoList';
import { BottomSummary } from './components/BottomSummary';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast } from './components/Toast';
import { NoticeBanner } from './components/NoticeBanner';
import { StorageAlert } from './components/StorageAlert';
import styles from './App.module.css';

export const App: React.FC = () => {
  const {
    tasks,
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
  } = useTodos();

  const [currentFilter, setCurrentFilter] = useState<TodoFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<{ message: string; actionText?: string; onAction?: () => void } | null>(null);

  const todoInputRef = useRef<TodoInputHandle>(null);

  // 전체 통계 (필터와 무관)
  const totalCount = tasks.length;
  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const remainingCount = totalCount - completedCount;

  // 검색 및 필터 교집합 적용
  const filteredTasks = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      // 1. 상태 필터
      if (currentFilter === 'active' && item.completed) return false;
      if (currentFilter === 'completed' && !item.completed) return false;

      // 2. 검색어 필터 (부분 문자열 매칭, 대소문자 무시)
      if (trimmedQuery && !item.text.toLowerCase().includes(trimmedQuery)) {
        return false;
      }

      return true;
    });
  }, [tasks, currentFilter, searchQuery]);

  const handleResetFilters = () => {
    setCurrentFilter('all');
    setSearchQuery('');
    setNotice(null);
  };

  const handleAddTodo = (text: string) => {
    const res = addTodo(text);
    if (res.success && res.task) {
      // 새 항목은 completed === false 상태
      const isVisibleInFilter = currentFilter !== 'completed';
      const isVisibleInSearch = !searchQuery.trim() || res.task.text.toLowerCase().includes(searchQuery.trim().toLowerCase());

      if (!isVisibleInFilter || !isVisibleInSearch) {
        setNotice({
          message: '할 일을 추가했어요. 현재 조건에서는 보이지 않습니다.',
          actionText: '전체 보기',
          onAction: handleResetFilters,
        });
      } else {
        setNotice(null);
      }
    }
  };

  const handleUndo = () => {
    const res = undoDelete();
    if (res.success && res.restoredTask) {
      const task = res.restoredTask;
      const isVisibleInFilter =
        currentFilter === 'all' ||
        (currentFilter === 'active' && !task.completed) ||
        (currentFilter === 'completed' && task.completed);
      const isVisibleInSearch =
        !searchQuery.trim() || task.text.toLowerCase().includes(searchQuery.trim().toLowerCase());

      if (!isVisibleInFilter || !isVisibleInSearch) {
        setNotice({
          message: '할 일을 복원했어요. 현재 조건에서는 보이지 않습니다.',
          actionText: '전체 보기',
          onAction: handleResetFilters,
        });
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.appCard}>
        {/* 스토리지 손상/상위 버전 경고 */}
        {(storageError === 'corrupted' || storageError === 'unsupported_version') && (
          <StorageAlert
            errorType={storageError}
            onReset={resetCorruptedStorage}
          />
        )}

        {/* 상단 헤더 */}
        <Header totalCount={totalCount} completedCount={completedCount} />

        {/* 새 할 일 입력 */}
        <TodoInput ref={todoInputRef} onAdd={handleAddTodo} />

        {/* 필터 및 검색으로 숨겨짐 알림 배너 */}
        {notice && (
          <NoticeBanner
            message={notice.message}
            actionText={notice.actionText}
            onAction={notice.onAction}
            onClose={() => setNotice(null)}
          />
        )}

        {/* 필터 및 검색창 */}
        <FilterSearch
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          filteredCount={filteredTasks.length}
          totalCount={totalCount}
        />

        {/* 할 일 목록 */}
        <TodoList
          tasks={filteredTasks}
          totalCount={totalCount}
          currentFilter={currentFilter}
          searchQuery={searchQuery}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
          onFocusInput={() => todoInputRef.current?.focus()}
          onClearSearch={() => setSearchQuery('')}
          onResetFilter={handleResetFilters}
        />

        {/* 하단 요약 및 일괄 삭제 */}
        <BottomSummary
          remainingCount={remainingCount}
          completedCount={completedCount}
          isSaveError={storageError === 'save_failed'}
          onOpenClearDialog={() => setIsConfirmOpen(true)}
          onRetrySave={retrySave}
        />
      </main>

      {/* 일괄 삭제 모달 대화상자 */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        count={completedCount}
        onConfirm={() => {
          clearCompleted();
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* 실행 취소 토스트 알림 */}
      {deletedHistory && (
        <Toast
          message="할 일을 삭제했어요."
          onUndo={handleUndo}
          onClose={dismissUndo}
        />
      )}
    </div>
  );
};

export default App;
