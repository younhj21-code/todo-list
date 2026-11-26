import React, { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  count,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // 열릴 때 취소 버튼에 포커스 (실수 삭제 방지)
      cancelButtonRef.current?.focus();
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Esc 키 또는 native dialog cancel 이벤트 처리
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onCancel();
  };

  // backdrop 클릭 감지 (dialog 바깥쪽 클릭 시 취소)
  const handleClickBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={handleClickBackdrop}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className={styles.dialogBody}>
        <h2 id="confirm-dialog-title" className={styles.title}>
          완료한 할 일을 삭제할까요?
        </h2>
        <p id="confirm-dialog-desc" className={styles.description}>
          완료한 할 일 <strong>{count}개</strong>가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>

        <div className={styles.actions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onConfirm}
          >
            {count}개 삭제
          </button>
        </div>
      </div>
    </dialog>
  );
};
