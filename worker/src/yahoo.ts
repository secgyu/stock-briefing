import type { EarningsEvent, Quote } from "../../src/types";
import { KR_CORP } from "./dart";

export interface YahooEnv {
  CACHE: KVNamespace;
}

// Yahoo 비공식 API. 데이터센터 기본 UA를 막는 경우가 있어 브라우저 UA를 명시한다.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const Q = "https://query2.finance.yahoo.com";

interface Session {
  cookie: string;
  crumb: string;
}

/**
 * 쿠키+크럼 핸드셰이크(Yahoo가 2023~ 필수화). KV에 1h 캐시해 매 요청 왕복을 피한다.
 * 1) fc.yahoo.com에서 세션 쿠키(A3)를 받고 2) 그 쿠키로 crumb 토큰을 발급받는다.
 */
async function session(env: YahooEnv, force = false): Promise<Session> {
  if (!force) {
    const hit = await env.CACHE.get<Session>("yh:session", "json");
    if (hit) return hit;
  }

  const r1 = await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": UA } });
  // ponytail: Set-Cookie가 접혀 와도 첫 "name=value"는 첫 ';' 앞이라 값 손상 없음(A3 값엔 콤마 없음).
  const cookie = (r1.headers.get("set-cookie") ?? "").split(";")[0];
  if (!cookie) throw new Error("yahoo: no cookie");

  const r2 = await fetch(`${Q}/v1/test/getcrumb`, { headers: { "User-Agent": UA, cookie } });
  const crumb = (await r2.text()).trim();
  if (!crumb || crumb.includes("<")) throw new Error("yahoo: no crumb");

  const s: Session = { cookie, crumb };
  await env.CACHE.put("yh:session", JSON.stringify(s), { expirationTtl: 3600 });
  return s;
}

interface YDate {
  fmt?: string; // "2026-07-29"
}
interface YResp {
  quoteSummary?: {
    result?: { calendarEvents?: { earnings?: { earningsDate?: YDate[]; isEarningsDateEstimate?: boolean } } }[];
  };
}

/**
 * 실적 발표월 → 대상 회계분기 라벨. 한국 기업은 분기 종료 ~1개월 뒤 발표(예: 7월 발표=Q2).
 * ponytail: 발표월 기반 추정. 정정발표 등 예외는 어긋날 수 있음(정확한 회계분기 API가 없음).
 */
function quarterLabel(fmt: string): string {
  const [y, m] = fmt.split("-").map(Number);
  if (m <= 3) return `${y - 1} Q4`;
  if (m <= 6) return `${y} Q1`;
  if (m <= 9) return `${y} Q2`;
  return `${y} Q3`;
}

async function oneEarnings(code: string, s: Session): Promise<EarningsEvent | null> {
  // 유니버스가 전부 코스피라 .KS 고정. (코스닥은 .KQ)
  const url = `${Q}/v10/finance/quoteSummary/${code}.KS?modules=calendarEvents&crumb=${encodeURIComponent(s.crumb)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, cookie: s.cookie } });
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const body = (await res.json()) as YResp;
  const e = body.quoteSummary?.result?.[0]?.calendarEvents?.earnings;
  const fmt = e?.earningsDate?.[0]?.fmt;
  if (!fmt) return null;
  return {
    symbol: code,
    name: KR_CORP[code]?.name ?? code,
    market: "KR",
    date: fmt,
    // Yahoo의 한국 실적일은 ±며칠 오차가 흔하고 isEarningsDateEstimate=false도 신뢰 어렵다
    // (실제 확정일은 회사 IR 공지가 유일한 정본). 그래서 국내는 항상 '예상'으로 정직하게 표기.
    isEstimated: true,
    quarter: quarterLabel(fmt),
  };
}

async function run(codes: string[], s: Session): Promise<EarningsEvent[]> {
  const settled = await Promise.allSettled(codes.map((c) => oneEarnings(c, s)));
  return settled.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}

/**
 * 국내 종목들의 다음 실적 발표일(Yahoo Finance). 세션(쿠키+크럼)은 한 번만 발급해 재사용한다.
 * 캐시된 크럼이 만료되면 전 종목이 401로 비니, 결과가 비면 세션을 재발급해 1회 재시도한다.
 */
export async function fetchKrEarnings(codes: string[], env: YahooEnv): Promise<EarningsEvent[]> {
  if (codes.length === 0) return [];
  let out = await run(codes, await session(env));
  if (out.length === 0) out = await run(codes, await session(env, true));
  return out;
}

interface YNum {
  raw?: number;
}
interface YPrice {
  regularMarketPrice?: YNum;
  regularMarketChange?: YNum;
  regularMarketChangePercent?: YNum; // 0.018 = 1.8%
  regularMarketTime?: number; // epoch sec
  marketCap?: YNum;
  currency?: string;
}

async function oneQuote(code: string, s: Session): Promise<Quote> {
  const url = `${Q}/v10/finance/quoteSummary/${code}.KS?modules=price&crumb=${encodeURIComponent(s.crumb)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, cookie: s.cookie } });
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const p = ((await res.json()) as { quoteSummary?: { result?: { price?: YPrice }[] } }).quoteSummary?.result?.[0]
    ?.price;
  const price = p?.regularMarketPrice?.raw;
  if (p == null || price == null) throw new Error("yahoo: no price");
  const t = p.regularMarketTime;
  return {
    price,
    change: p.regularMarketChange?.raw ?? 0,
    changePct: (p.regularMarketChangePercent?.raw ?? 0) * 100,
    currency: p.currency ?? "KRW",
    marketCap: p.marketCap?.raw,
    asOf: t ? new Date(t * 1000).toISOString() : new Date().toISOString(),
  };
}

/**
 * 국내 종목 지연 시세(Yahoo, KRX 20분 지연). 크럼 만료 시 세션 재발급 후 1회 재시도.
 * 실패하면 throw → 상위에서 금융위 종가로 폴백한다.
 */
export async function fetchKrQuoteYahoo(code: string, env: YahooEnv): Promise<Quote> {
  try {
    return await oneQuote(code, await session(env));
  } catch {
    return await oneQuote(code, await session(env, true));
  }
}
