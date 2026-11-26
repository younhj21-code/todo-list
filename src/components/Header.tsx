import React from 'react';
import { getFormattedToday } from '../lib/date';
import styles from './Header.module.css';

interface HeaderProps {
  totalCount: number;
  completedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalCount, completedCount }) => {
  const todayStr = getFormattedToday();
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <time className={styles.date} dateTime={new Date().toISOString().split('T')[0]}>
          {todayStr}
        </time>
        <span className={styles.badge} aria-label={`전체 ${totalCount}개 중 ${completedCount}개 완료`}>
          {completedCount} / {totalCount} 완료
        </span>
      </div>

      <h1 className={styles.title}>나의 할 일</h1>
      <p className={styles.subtitle}>작은 실천으로 채우는 하루</p>

      <div className={styles.progressContainer}>
        <div className={styles.progressLabel}>
          <span>오늘의 진행률</span>
          <span className={styles.percentText}>{percentage}%</span>
        </div>
        <div
          className={styles.progressBarBg}
          role="progressbar"
          aria-label="오늘의 할 일 진행률"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles.progressBarFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </header>
  );
};
