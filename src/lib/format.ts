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

/** 시세 통화 표기. USD → $1,234.56 / KRW → 73,000원(정수) */
export function formatPrice(price: number, currency: string): string {
  if (currency === "KRW") return `${Math.round(price).toLocaleString("ko-KR")}원`;
  const n = price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "USD" ? `$${n}` : `${n} ${currency}`;
}

/**
 * 시가총액 표기. 통화별로 단위가 다르다.
 * - USD: 값이 "백만 USD" 단위(Finnhub) → $3.45T / $12.3B / $456M
 * - KRW: 값이 "원" 절대값(금융위) → 400.1조원 / 3,456억원
 */
export function formatMarketCap(cap?: number, currency = "USD"): string | null {
  if (cap == null || cap <= 0) return null;
  if (currency === "KRW") {
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}조원`;
    if (cap >= 1e8) return `${Math.round(cap / 1e8).toLocaleString("ko-KR")}억원`;
    return `${Math.round(cap).toLocaleString("ko-KR")}원`;
  }
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}T`;
  if (cap >= 1_000) return `$${(cap / 1_000).toFixed(1)}B`;
  return `$${Math.round(cap)}M`;
}

export function earningsTimeLabel(time?: EarningsTime): string | null {
  if (time === "BMO") return "개장 전";
  if (time === "AMC") return "장 마감 후";
  return null;
}

/** ISO 시각을 로컬(KST) "7월 8일 05:00"으로. 시세 기준 시각 표기용. */
export function formatDateTimeKo(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${hh}:${mm}`;
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

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-07-09" → "7월 9일 (목)" */
export function formatDateKo(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${wd})`;
}
