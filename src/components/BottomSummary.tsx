import React from 'react';
import styles from './BottomSummary.module.css';

interface BottomSummaryProps {
  remainingCount: number;
  completedCount: number;
  isSaveError: boolean;
  onOpenClearDialog: () => void;
  onRetrySave: () => void;
}

export const BottomSummary: React.FC<BottomSummaryProps> = ({
  remainingCount,
  completedCount,
  isSaveError,
  onOpenClearDialog,
  onRetrySave,
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.actionRow}>
        <span className={styles.remainingText}>
          남은 할 일 <strong>{remainingCount}</strong>개
        </span>
        <button
          type="button"
          className={styles.clearCompletedButton}
          disabled={completedCount === 0}
          onClick={onOpenClearDialog}
          aria-label={`완료한 할 일 ${completedCount}개 일괄 삭제`}
        >
          완료 항목 삭제
        </button>
      </div>

      <div className={styles.noticeRow}>
        {isSaveError ? (
          <div className={styles.saveErrorContainer} role="alert">
            <span className={styles.saveErrorText}>
              변경 내용을 이 브라우저에 저장하지 못했어요.
            </span>
            <button
              type="button"
              className={styles.retryButton}
              onClick={onRetrySave}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <span className={styles.autoSaveNotice}>
            이 브라우저에 자동 저장됩니다.
          </span>
        )}
      </div>
    </footer>
  );
};
