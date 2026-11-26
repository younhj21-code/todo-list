import React from 'react';
import styles from './StorageAlert.module.css';

interface StorageAlertProps {
  errorType: 'corrupted' | 'unsupported_version';
  onReset: () => void;
}

export const StorageAlert: React.FC<StorageAlertProps> = ({ errorType, onReset }) => {
  return (
    <div className={styles.alert} role="alert">
      <div className={styles.content}>
        <p className={styles.title}>
          {errorType === 'unsupported_version'
            ? '더 최신 버전에서 저장된 데이터입니다.'
            : '저장된 목록을 읽지 못했어요.'}
        </p>
        <p className={styles.desc}>
          {errorType === 'unsupported_version'
            ? '기존 데이터 보호를 위해 덮어쓰지 않았습니다. 계속 사용하려면 목록을 초기화해야 합니다.'
            : '저장 데이터가 손상되었으나 기존 데이터는 덮어쓰지 않았습니다.'}
        </p>
      </div>
      <button
        type="button"
        className={styles.resetButton}
        onClick={() => {
          if (window.confirm('기존 저장 데이터를 초기화하고 새로 시작할까요?')) {
            onReset();
          }
        }}
      >
        새로 초기화
      </button>
    </div>
  );
};
