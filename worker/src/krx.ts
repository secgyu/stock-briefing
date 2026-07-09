import type { Quote } from "../../src/types";

export interface KrxEnv {
  DATA_GO_KR_KEY: string;
}

// 공공데이터포털 금융위 주식시세정보(일별 종가). 실시간이 아니라 전일 종가 기준.
const BASE = "https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

interface KrPriceItem {
  basDt: string; // 기준일자 YYYYMMDD
  srtnCd: string; // 단축코드(6자리)
  itmsNm: string; // 종목명
  mrktCtg: string; // KOSPI/KOSDAQ
  clpr: string; // 종가
  vs: string; // 전일 대비
  fltRt: string; // 등락률(%)
  mrktTotAmt: string; // 시가총액(원)
}

interface KrPriceResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: { item?: KrPriceItem[] | KrPriceItem } };
  };
}

/**
 * 국내 종목의 최신 종가 시세. 주말·공휴일을 감안해 최근 ~12일 창에서 가장 최근 영업일을 고른다.
 * 데이터 없음/미상장이면 null, 인증 등 오류는 throw → 상위에서 폴백(null).
 */
export async function fetchKrQuote(stockCode: string, env: KrxEnv): Promise<Quote | null> {
  const now = new Date();
  const begin = ymd(new Date(now.getTime() - 12 * 86400000));
  const url =
    `${BASE}?serviceKey=${encodeURIComponent(env.DATA_GO_KR_KEY)}&resultType=json` +
    `&numOfRows=30&pageNo=1&beginBasDt=${begin}&likeSrtnCd=${stockCode}`;

  const res = await fetch(url, { headers: { "User-Agent": "stock-briefing/1.0" } });
  if (!res.ok) throw new Error(`datago ${res.status}`);
  const body = (await res.json()) as KrPriceResponse;

  const code = body.response?.header?.resultCode;
  if (code && code !== "00") throw new Error(`datago result ${code}`);

  const raw = body.response?.body?.items?.item;
  const items: KrPriceItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  // likeSrtnCd는 부분일치라 정확한 단축코드만 남긴다.
  const mine = items.filter((i) => i.srtnCd === stockCode);
  if (mine.length === 0) return null;

  const latest = mine.reduce((a, b) => (a.basDt >= b.basDt ? a : b));
  const dt = latest.basDt;
  const cap = Number(latest.mrktTotAmt);
  return {
    price: Number(latest.clpr),
    change: Number(latest.vs),
    changePct: Number(latest.fltRt),
    currency: "KRW",
    marketCap: Number.isFinite(cap) && cap > 0 ? cap : undefined,
    asOf: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
  };
}
