import type { SymbolInfo } from "../types";

// 검색·상세용 종목 마스터(하드코딩된 실제 정보). US는 finnhub.ts의 유니버스로 보강된다.
export const MOCK_SYMBOLS: SymbolInfo[] = [
  { symbol: "005930", name: "삼성전자", market: "KR", exchange: "KOSPI" },
  { symbol: "000660", name: "SK하이닉스", market: "KR", exchange: "KOSPI" },
  { symbol: "035420", name: "NAVER", market: "KR", exchange: "KOSPI" },
  { symbol: "035720", name: "카카오", market: "KR", exchange: "KOSPI" },
  { symbol: "005380", name: "현대차", market: "KR", exchange: "KOSPI" },
  { symbol: "373220", name: "LG에너지솔루션", market: "KR", exchange: "KOSPI" },
  { symbol: "AAPL", name: "애플", market: "US", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "마이크로소프트", market: "US", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "테슬라", market: "US", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "엔비디아", market: "US", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "알파벳", market: "US", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "아마존", market: "US", exchange: "NASDAQ" },
  { symbol: "JNJ", name: "존슨앤존슨", market: "US", exchange: "NYSE" },
  { symbol: "KO", name: "코카콜라", market: "US", exchange: "NYSE" },
];
