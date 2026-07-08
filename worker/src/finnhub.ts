import type { EarningsEvent, EarningsTime, IpoEvent, SymbolInfo } from "../../src/types";

export interface Env {
  FINNHUB_API_KEY: string;
}

const BASE = "https://finnhub.io/api/v1";

/** 실적 캘린더는 티커만 주므로, 노출할 미국 주요 종목만 이 맵으로 골라 한글명을 붙인다. */
const US_UNIVERSE: Record<string, string> = {
  AAPL: "애플",
  MSFT: "마이크로소프트",
  NVDA: "엔비디아",
  AMZN: "아마존",
  GOOGL: "알파벳(구글)",
  META: "메타",
  TSLA: "테슬라",
  AVGO: "브로드컴",
  AMD: "AMD",
  NFLX: "넷플릭스",
  INTC: "인텔",
  QCOM: "퀄컴",
  ADBE: "어도비",
  CRM: "세일즈포스",
  ORCL: "오라클",
  CSCO: "시스코",
  PYPL: "페이팔",
  DIS: "디즈니",
  KO: "코카콜라",
  PEP: "펩시코",
  MCD: "맥도날드",
  NKE: "나이키",
  SBUX: "스타벅스",
  JPM: "JP모건",
  V: "비자",
  MA: "마스터카드",
  BAC: "뱅크오브아메리카",
  WMT: "월마트",
  COST: "코스트코",
  BA: "보잉",
  UBER: "우버",
  PLTR: "팔란티어",
  JNJ: "존슨앤존슨",
  XOM: "엑슨모빌",
  CVX: "셰브론",
  PFE: "화이자",
  LRCX: "램리서치",
  TXN: "텍사스인스트루먼트",
  IBM: "IBM",
  GE: "GE에어로스페이스",
  GS: "골드만삭스",
  MS: "모건스탠리",
  WFC: "웰스파고",
  ABBV: "애브비",
  // 반도체·하드웨어
  MU: "마이크론",
  AMAT: "어플라이드머티리얼즈",
  ARM: "ARM",
  MRVL: "마벨",
  SMCI: "슈퍼마이크로",
  DELL: "델",
  HPQ: "HP",
  // 소프트웨어·플랫폼
  NOW: "서비스나우",
  SHOP: "쇼피파이",
  SNOW: "스노우플레이크",
  CRWD: "크라우드스트라이크",
  PANW: "팔로알토네트웍스",
  ANET: "아리스타네트웍스",
  SPOT: "스포티파이",
  ABNB: "에어비앤비",
  BKNG: "부킹홀딩스",
  COIN: "코인베이스",
  HOOD: "로빈후드",
  // 헬스케어
  LLY: "일라이릴리",
  UNH: "유나이티드헬스",
  MRK: "머크",
  TMO: "써모피셔",
  ABT: "애벗",
  MRNA: "모더나",
  // 산업·에너지·소비
  CAT: "캐터필러",
  DE: "디어",
  HON: "허니웰",
  UPS: "UPS",
  GM: "제너럴모터스",
  F: "포드",
  RIVN: "리비안",
  HD: "홈디포",
  LOW: "로우스",
  TGT: "타겟",
  PG: "P&G",
  MDLZ: "몬델리즈",
  // 통신·미디어
  T: "AT&T",
  VZ: "버라이즌",
  TMUS: "T모바일",
  CMCSA: "컴캐스트",
  // 금융
  C: "씨티그룹",
  AXP: "아메리칸익스프레스",
  BLK: "블랙록",
  SCHW: "찰스슈왑",
};

/** universe 티커 목록(청크 분할용). */
export const US_SYMBOLS = Object.keys(US_UNIVERSE);

/**
 * 종목 검색·상세용 SymbolInfo. exchange는 종목별로 미상이라 빈 값으로 두고,
 * 프런트에서 시장명("해외")으로 대체한다. (정확한 거래소가 필요해지면 profile2로 보강)
 */
export const US_INFO: SymbolInfo[] = Object.entries(US_UNIVERSE).map(([symbol, name]) => ({
  symbol,
  name,
  market: "US",
  exchange: "",
}));

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** YYYY-MM-DD 에 n일 더하기(월말 안전, UTC 기준). */
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/**
 * 미국 실적일을 한국시간(KST) 기준 날짜로 변환.
 * 장 마감 후(AMC, ~16:00 ET)는 KST로 다음날 새벽 → +1일. 개장 전(BMO)·장중은 같은 날.
 * (토스 앱도 KST로 표기해 AMC 종목이 하루 뒤로 보인다.)
 */
const toKstDate = (usDate: string, hour?: string): string => (hour === "amc" ? addDays(usDate, 1) : usDate);

/** 오늘부터 +days 까지의 [from,to] 날짜 문자열. Finnhub 무료는 최대 1개월. */
function window(days: number): { from: string; to: string } {
  const now = new Date();
  const to = new Date(now.getTime() + days * 86400000);
  return { from: ymd(now), to: ymd(to) };
}

async function fetchJson<T>(path: string, env: Env): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}token=${env.FINNHUB_API_KEY}`);
  if (!res.ok) throw new Error(`finnhub ${res.status} ${path}`);
  return (await res.json()) as T;
}

const hourToTime = (hour?: string): EarningsTime | undefined =>
  hour === "bmo" ? "BMO" : hour === "amc" ? "AMC" : undefined;

interface FinnhubEarning {
  date: string;
  symbol: string;
  hour?: string;
  quarter?: number;
  year?: number;
}

interface FinnhubIpo {
  date: string;
  symbol?: string;
  name: string;
  exchange?: string;
  status?: string;
}

/**
 * 주어진 종목들의 다가오는 실적을 병렬 조회해 합친다(일부 실패는 무시).
 * 심볼 없는 전체 캘린더는 무료 티어에서 대장주를 누락해 부정확하므로 종목별로 조회한다.
 * 외부 fetch 50개/요청 한계 때문에 호출부에서 청크로 나눠 부른다.
 */
export async function fetchUsEarningsForSymbols(symbols: string[], env: Env): Promise<EarningsEvent[]> {
  const settled = await Promise.allSettled(symbols.map((s) => fetchUsEarningsForSymbol(s, env)));
  const out: EarningsEvent[] = [];
  for (const r of settled) if (r.status === "fulfilled") out.push(...r.value);
  return out;
}

/** 특정 미국 종목의 실적(과거 포함). universe 밖이면 티커를 이름으로 사용. */
export async function fetchUsEarningsForSymbol(symbol: string, env: Env): Promise<EarningsEvent[]> {
  const { from } = window(0);
  const to = ymd(new Date(Date.now() + 90 * 86400000));
  const body = await fetchJson<{ earningsCalendar?: FinnhubEarning[] }>(
    `/calendar/earnings?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`,
    env,
  );
  return (body.earningsCalendar ?? []).map((e) => ({
    symbol: e.symbol,
    name: US_UNIVERSE[e.symbol] ?? e.symbol,
    market: "US" as const,
    date: toKstDate(e.date, e.hour),
    time: hourToTime(e.hour),
    isEstimated: false,
    quarter: e.year && e.quarter ? `${e.year} Q${e.quarter}` : "",
  }));
}

/** 다가오는 미국 IPO. */
export async function fetchUsIpos(env: Env): Promise<IpoEvent[]> {
  const { from, to } = window(31);
  const body = await fetchJson<{ ipoCalendar?: FinnhubIpo[] }>(`/calendar/ipo?from=${from}&to=${to}`, env);
  return (body.ipoCalendar ?? [])
    .filter((i) => i.name && i.status !== "withdrawn")
    .map((i) => ({
      symbol: i.symbol || undefined,
      name: i.name,
      market: "US" as const,
      date: i.date,
      isEstimated: i.status !== "priced",
    }));
}
