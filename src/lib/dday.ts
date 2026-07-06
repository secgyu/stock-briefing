/**
 * 오늘(자정 기준)부터 target 날짜까지 남은 일수.
 * 시/분 차이로 인한 오차를 없애기 위해 양쪽 모두 자정으로 정규화한다.
 */
export function daysUntil(dateStr: string, from: Date = new Date()): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const base = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target - base) / 86_400_000);
}

/** D-day 배지에 표시할 라벨. 오늘=D-DAY, 미래=D-n, 과거=D+n */
export function ddayLabel(dateStr: string, from: Date = new Date()): string {
  const diff = daysUntil(dateStr, from);
  if (diff === 0) return "D-DAY";
  return diff > 0 ? `D-${diff}` : `D+${-diff}`;
}

/** D-7 이내(오늘 포함)면 임박으로 강조 */
export function isImminent(dateStr: string, from: Date = new Date()): boolean {
  const diff = daysUntil(dateStr, from);
  return diff >= 0 && diff <= 7;
}
