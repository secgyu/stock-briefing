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

export type DdayTier = "imminent" | "near" | "far";

/**
 * D-day 강조 단계. 빨강 남용을 막으려 임박(≤D-2)만 빨강, 근접(D-3~D-7)은
 * 브랜드 블루, 그 외(D-8+ / 과거)는 회색으로 위계를 준다.
 */
export function ddayTier(dateStr: string, from: Date = new Date()): DdayTier {
  const diff = daysUntil(dateStr, from);
  if (diff >= 0 && diff <= 2) return "imminent";
  if (diff >= 3 && diff <= 7) return "near";
  return "far";
}
