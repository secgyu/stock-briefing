import type { EarningsEvent, IpoEvent, NewsItem, Quote, SectorRank, SymbolInfo } from "../types";

// 배포된 Worker. 로컬 워커로 붙일 땐 이 한 줄만 바꾸면 된다(예: http://127.0.0.1:8787).
// ponytail: 환경변수 스위칭은 필요해지면 도입. 지금은 상수 하나로 충분.
const BASE = "https://stock-briefing-api.oilwhere.workers.dev";

/** {updatedAt, data} 봉투에서 data만 꺼내 반환. 실패 시 throw → useAsync가 error 상태로 처리. */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  const body = (await res.json()) as { updatedAt: string; data: T };
  return body.data;
}

const qs = (v: string) => encodeURIComponent(v);

export const api = {
  upcomingEarnings: () => get<EarningsEvent[]>("/earnings/upcoming"),
  earnings: (symbol: string) => get<EarningsEvent[]>(`/earnings?symbol=${qs(symbol)}`),
  ipos: () => get<IpoEvent[]>("/ipo"),
  sectors: () => get<SectorRank[]>("/sectors"),
  news: (symbol?: string) => get<NewsItem[]>(symbol ? `/news?symbol=${qs(symbol)}` : "/news"),
  symbols: (q: string) => get<SymbolInfo[]>(`/symbols?q=${qs(q)}`),
  quote: (symbol: string) => get<Quote | null>(`/quote?symbol=${qs(symbol)}`),
};
