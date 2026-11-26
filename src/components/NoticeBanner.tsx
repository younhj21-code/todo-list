import React from 'react';
import { CloseIcon } from './Icons';
import styles from './NoticeBanner.module.css';

interface NoticeBannerProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  message,
  actionText,
  onAction,
  onClose,
}) => {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      <div className={styles.actions}>
        {actionText && onAction && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={onAction}
          >
            {actionText}
          </button>
        )}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="안내 닫기"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
};
