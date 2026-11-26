import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { PlusIcon } from './Icons';
import styles from './TodoInput.module.css';

export interface TodoInputHandle {
  focus: () => void;
}

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export const TodoInput = forwardRef<TodoInputHandle, TodoInputProps>(({ onAdd }, ref) => {
  const [text, setText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setErrorMessage('할 일을 입력해 주세요.');
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setErrorMessage('할 일은 최대 200자까지 입력할 수 있습니다.');
      return;
    }

    onAdd(trimmed);
    setText('');
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 Enter는 무시 (조합 완료 전 조기 submit 방지)
    const isComposing = e.nativeEvent.isComposing || (e as unknown as { isComposing?: boolean }).isComposing;
    if (e.key === 'Enter') {
      if (isComposing) {
        e.preventDefault();
        return;
      }
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-todo-input" className="sr-only">
        새 할 일
      </label>

      <div className={styles.inputRow}>
        <div className={styles.inputWrapper}>
          <input
            id="new-todo-input"
            ref={inputRef}
            type="text"
            className={`${styles.input} ${errorMessage ? styles.inputError : ''}`}
            placeholder="어떤 일을 할 예정인가요?"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={200}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? 'todo-input-error' : undefined}
            autoComplete="off"
          />
          {text.length >= 180 && (
            <span className={styles.charCount} aria-hidden="true">
              {text.length}/200
            </span>
          )}
        </div>

        <button type="submit" className={styles.addButton} aria-label="할 일 추가">
          <PlusIcon size={20} />
          <span className={styles.buttonText}>추가</span>
        </button>
      </div>

      {errorMessage && (
        <p id="todo-input-error" className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
});

TodoInput.displayName = 'TodoInput';
