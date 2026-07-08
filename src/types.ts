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

export interface Disclosure {
  title: string; // 보고서명 (report_nm)
  filer: string; // 제출인 (flr_nm)
  date: string; // 접수일 YYYY-MM-DD
  url: string; // 공시 원문 뷰어 링크
}

export interface Quote {
  price: number;
  change: number; // 전일 대비 (통화 단위)
  changePct: number; // 전일 대비 %
  currency: string; // "USD"
  marketCap?: number; // 시가총액 (단위: 백만 USD, Finnhub profile2)
  asOf: string; // 조회 시각 ISO
}
