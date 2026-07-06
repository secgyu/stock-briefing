export type Market = "KR" | "US";

export type EarningsTime = "BMO" | "AMC";

export interface EarningsEvent {
  symbol: string;
  name: string;
  market: Market;
  date: string; // YYYY-MM-DD
  time?: EarningsTime; // 개장 전(BMO) / 장 마감 후(AMC)
  isEstimated: boolean; // 국내 예상일 여부
  quarter: string; // "2026 Q2"
}

export interface IpoEvent {
  symbol?: string;
  name: string;
  market: Market;
  date: string; // 상장(예정)일
  isEstimated: boolean;
}

export interface SectorRank {
  rank: number;
  name: string;
  market: Market;
  weeklyChangePct: number;
}

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: string; // ISO datetime
  url: string;
  symbol?: string;
}

export interface WatchItem {
  symbol: string;
  name: string;
  market: Market;
  addedAt: string; // ISO datetime
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  market: Market;
  exchange: string;
}
