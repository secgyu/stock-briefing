import { adaptive } from "@toss/tds-colors";
import type { EarningsTime, Market } from "../types";

/** 등락률 색: 상승 빨강 / 하락 파랑 (국내 관습) / 보합 회색. 다크모드 자동 대응 */
export function changeColor(pct: number): string {
  if (pct > 0) return adaptive.red500;
  if (pct < 0) return adaptive.blue500;
  return adaptive.grey600;
}

/** 등락률 표기: +4.2% / -1.1% / 0.0% */
export function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function marketFlag(market: Market): string {
  return market === "KR" ? "🇰🇷" : "🇺🇸";
}

export function marketLabel(market: Market): string {
  return market === "KR" ? "국내" : "해외";
}

export function earningsTimeLabel(time?: EarningsTime): string | null {
  if (time === "BMO") return "개장 전";
  if (time === "AMC") return "장 마감 후";
  return null;
}

/** ISO 시각을 "n분 전 / n시간 전 / n일 전"으로 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
}

/** "2026-07-09" → "7월 9일 (목)" */
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export function formatDateKo(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${wd})`;
}
