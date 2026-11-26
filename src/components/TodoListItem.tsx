import React, { useState, useRef, useEffect } from 'react';
import { TodoItem } from '../types/todo';
import { EditIcon, TrashIcon, CheckIcon } from './Icons';
import styles from './TodoListItem.module.css';

interface TodoListItemProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
}

export const TodoListItem: React.FC<TodoListItemProps> = ({
  item,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editError, setEditError] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(false);

  // 편집 모드 진입 시 인풋 자동 포커스
  useEffect(() => {
    if (isEditing) {
      wasEditingRef.current = true;
      editInputRef.current?.focus();
      editInputRef.current?.select();
    } else if (wasEditingRef.current) {
      // 편집 모드 종료 후 수정 버튼으로 포커스 복귀
      editButtonRef.current?.focus();
      wasEditingRef.current = false;
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(item.text);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(item.text);
    setEditError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError('할 일을 입력해 주세요.');
      editInputRef.current?.focus();
      return;
    }
    if (trimmed.length > 200) {
      setEditError('할 일은 최대 200자까지 입력할 수 있습니다.');
      return;
    }

    const success = onEdit(item.id, trimmed);
    if (success) {
      setIsEditing(false);
      setEditError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSaveEdit();
    }
  };

  return (
    <li className={`${styles.item} ${item.completed ? styles.completed : ''}`}>
      {isEditing ? (
        /* 수정 모드 */
        <div className={styles.editContainer}>
          <div className={styles.editInputWrapper}>
            <label htmlFor={`edit-input-${item.id}`} className="sr-only">
              할 일 수정
            </label>
            <input
              id={`edit-input-${item.id}`}
              ref={editInputRef}
              type="text"
              className={`${styles.editInput} ${editError ? styles.editInputError : ''}`}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                if (editError) setEditError(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={200}
              aria-invalid={editError ? 'true' : 'false'}
              aria-describedby={editError ? `edit-error-${item.id}` : undefined}
            />
            {editError && (
              <span id={`edit-error-${item.id}`} className={styles.editErrorMessage} role="alert">
                {editError}
              </span>
            )}
          </div>

          <div className={styles.editActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveEdit}
              aria-label="수정 내용 저장"
            >
              저장
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelEdit}
              aria-label="수정 취소"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        /* 기본 조회 모드 */
        <div className={styles.viewContainer}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={item.completed}
              onChange={() => onToggle(item.id)}
              aria-label={`${item.text} 완료 여부`}
            />
            <span className={styles.customCheck} aria-hidden="true">
              {item.completed && <CheckIcon size={14} />}
            </span>
            <span className={styles.text}>{item.text}</span>
          </label>

          <div className={styles.actions}>
            <button
              ref={editButtonRef}
              type="button"
              className={styles.actionButton}
              onClick={handleStartEdit}
              aria-label={`"${item.text}" 수정`}
              title="수정"
            >
              <EditIcon size={18} />
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={() => onDelete(item.id)}
              aria-label={`"${item.text}" 삭제`}
              title="삭제"
            >
              <TrashIcon size={18} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
};
