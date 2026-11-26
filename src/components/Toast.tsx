import React from 'react';
import { CloseIcon } from './Icons';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose }) => {
  return (
    <div className={styles.toastContainer} role="status" aria-live="polite">
      <div className={styles.toast}>
        <span className={styles.message}>{message}</span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.undoButton}
            onClick={onUndo}
            aria-label="삭제한 할 일 실행 취소"
          >
            실행 취소
          </button>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="알림 닫기"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
