import React from 'react';
import { TodoFilter } from '../types/todo';
import { SearchIcon, CloseIcon } from './Icons';
import styles from './FilterSearch.module.css';

interface FilterSearchProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterSearch: React.FC<FilterSearchProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onClearSearch,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className={styles.container}>
      {/* 상태 필터 그룹 */}
      <div className={styles.filterGroup} role="group" aria-label="할 일 상태 필터">
        <button
          type="button"
          className={`${styles.filterButton} ${currentFilter === 'all' ? styles.active : ''}`}
          aria-pressed={currentFilter === 'all'}
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button
          type="button"
          className={`${styles.filterButton} ${currentFilter === 'active' ? styles.active : ''}`}
          aria-pressed={currentFilter === 'active'}
          onClick={() => onFilterChange('active')}
        >
          진행 중
        </button>
        <button
          type="button"
          className={`${styles.filterButton} ${currentFilter === 'completed' ? styles.active : ''}`}
          aria-pressed={currentFilter === 'completed'}
          onClick={() => onFilterChange('completed')}
        >
          완료
        </button>
      </div>

      {/* 검색창 */}
      <div className={styles.searchWrapper}>
        <label htmlFor="todo-search-input" className="sr-only">
          할 일 검색
        </label>
        <SearchIcon className={styles.searchIcon} size={18} />
        <input
          id="todo-search-input"
          type="search"
          className={styles.searchInput}
          placeholder="할 일 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearSearch}
            aria-label="입력된 검색어 지우기"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* 검색어가 있거나 필터가 걸려있을 때 검색 결과 보조 안내 (sr-only 또는 작은 텍스트) */}
      {(searchQuery.trim() !== '' || currentFilter !== 'all') && totalCount > 0 && (
        <div className={styles.metaInfo} aria-live="polite">
          {searchQuery.trim() !== '' ? `검색 결과 ${filteredCount}개` : `목록 ${filteredCount}개`}
        </div>
      )}
    </div>
  );
};
