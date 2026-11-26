/**
 * 현재 기기 로컬 날짜를 한국어 표준 형식으로 반환합니다.
 * 예: 2026년 11월 26일 목요일
 */
export function getFormattedToday(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  return formatter.format(date);
}
