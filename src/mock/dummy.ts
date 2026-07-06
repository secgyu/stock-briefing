import type { EarningsEvent, IpoEvent, NewsItem, SectorRank, SymbolInfo, WatchItem } from "../types";

/** 오늘로부터 n일 뒤(YYYY-MM-DD). 더미데이터 D-day가 항상 자연스럽게 보이도록 상대 계산 */
function dayOffset(n: number, base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function hoursAgo(h: number, base: Date = new Date()): string {
  return new Date(base.getTime() - h * 3_600_000).toISOString();
}

export const MOCK_EARNINGS: EarningsEvent[] = [
  {
    symbol: "AAPL",
    name: "애플",
    market: "US",
    date: dayOffset(3),
    time: "AMC",
    isEstimated: false,
    quarter: "2026 Q3",
  },
  {
    symbol: "TSLA",
    name: "테슬라",
    market: "US",
    date: dayOffset(7),
    time: "AMC",
    isEstimated: false,
    quarter: "2026 Q2",
  },
  {
    symbol: "JNJ",
    name: "존슨앤존슨",
    market: "US",
    date: dayOffset(9),
    time: "BMO",
    isEstimated: false,
    quarter: "2026 Q2",
  },
  {
    symbol: "MSFT",
    name: "마이크로소프트",
    market: "US",
    date: dayOffset(4),
    time: "AMC",
    isEstimated: false,
    quarter: "2026 Q4",
  },
  {
    symbol: "KO",
    name: "코카콜라",
    market: "US",
    date: dayOffset(15),
    time: "BMO",
    isEstimated: false,
    quarter: "2026 Q2",
  },
  {
    symbol: "NVDA",
    name: "엔비디아",
    market: "US",
    date: dayOffset(45),
    time: "AMC",
    isEstimated: false,
    quarter: "2027 Q2",
  },
  { symbol: "005930", name: "삼성전자", market: "KR", date: dayOffset(22), isEstimated: true, quarter: "2026 Q2" },
  { symbol: "000660", name: "SK하이닉스", market: "KR", date: dayOffset(18), isEstimated: true, quarter: "2026 Q2" },
  { symbol: "035420", name: "NAVER", market: "KR", date: dayOffset(30), isEstimated: true, quarter: "2026 Q2" },
  { symbol: "035720", name: "카카오", market: "KR", date: dayOffset(2), isEstimated: true, quarter: "2026 Q2" },
];

export const MOCK_IPOS: IpoEvent[] = [
  { symbol: undefined, name: "레몬헬스케어", market: "KR", date: dayOffset(0), isEstimated: false },
  { symbol: undefined, name: "뷰티테크", market: "KR", date: dayOffset(2), isEstimated: true },
  { symbol: "FIG", name: "Figma", market: "US", date: dayOffset(4), isEstimated: false },
  { symbol: "DBX2", name: "Databricks", market: "US", date: dayOffset(9), isEstimated: false },
];

export const MOCK_SECTORS: SectorRank[] = [
  { rank: 1, name: "조선", market: "KR", weeklyChangePct: 5.1 },
  { rank: 2, name: "반도체", market: "KR", weeklyChangePct: 4.2 },
  { rank: 3, name: "Technology", market: "US", weeklyChangePct: 3.1 },
  { rank: 4, name: "자동차", market: "KR", weeklyChangePct: 2.3 },
  { rank: 5, name: "바이오", market: "KR", weeklyChangePct: 0.8 },
  { rank: 6, name: "2차전지", market: "KR", weeklyChangePct: -1.1 },
  { rank: 7, name: "Energy", market: "US", weeklyChangePct: -2.4 },
];

export const MOCK_MARKET_NEWS: NewsItem[] = [
  {
    title: "코스피, 외국인 매수세에 2년 만에 최고치 경신",
    source: "연합뉴스",
    publishedAt: hoursAgo(1),
    url: "https://example.com/news/1",
  },
  {
    title: "미 연준, 금리 동결 시사… 기술주 강세",
    source: "한국경제",
    publishedAt: hoursAgo(3),
    url: "https://example.com/news/2",
  },
  {
    title: "반도체 업황 회복 신호… 수출 지표 개선",
    source: "매일경제",
    publishedAt: hoursAgo(5),
    url: "https://example.com/news/3",
  },
  {
    title: "국내 IPO 시장 활기… 하반기 대어 줄줄이 대기",
    source: "이데일리",
    publishedAt: hoursAgo(8),
    url: "https://example.com/news/4",
  },
  {
    title: "이번 주 실적 발표 앞둔 빅테크 주목",
    source: "머니투데이",
    publishedAt: hoursAgo(11),
    url: "https://example.com/news/5",
  },
];

const SYMBOL_NEWS: Record<string, NewsItem[]> = {
  AAPL: [
    {
      title: "애플, 신형 아이폰 공개 앞두고 부품 수급 확대",
      source: "Bloomberg",
      publishedAt: hoursAgo(2),
      url: "https://example.com/aapl/1",
      symbol: "AAPL",
    },
    {
      title: "애플 서비스 매출 사상 최대 전망",
      source: "Reuters",
      publishedAt: hoursAgo(20),
      url: "https://example.com/aapl/2",
      symbol: "AAPL",
    },
  ],
  "005930": [
    {
      title: "삼성전자, HBM 공급 확대로 반도체 실적 개선 기대",
      source: "연합뉴스",
      publishedAt: hoursAgo(4),
      url: "https://example.com/sec/1",
      symbol: "005930",
    },
    {
      title: "삼성전자 2분기 잠정실적 발표 임박",
      source: "한국경제",
      publishedAt: hoursAgo(26),
      url: "https://example.com/sec/2",
      symbol: "005930",
    },
  ],
};

export function mockNewsFor(symbol?: string): NewsItem[] {
  if (!symbol) return MOCK_MARKET_NEWS;
  return SYMBOL_NEWS[symbol] ?? [];
}

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

/** 첫 실행 시 관심 목록이 비어있으면 데모용으로 미리 담아두는 종목 */
export const DEFAULT_WATCHLIST: WatchItem[] = [
  { symbol: "AAPL", name: "애플", market: "US", addedAt: hoursAgo(48) },
  { symbol: "005930", name: "삼성전자", market: "KR", addedAt: hoursAgo(24) },
];

/** 종목의 다음 실적 이벤트(관심 D-day 계산용) */
export function nextEarningsFor(symbol: string): EarningsEvent | undefined {
  return MOCK_EARNINGS.filter((e) => e.symbol === symbol).sort((a, b) => a.date.localeCompare(b.date))[0];
}
