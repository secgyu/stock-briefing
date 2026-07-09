import { daysUntil } from "../../src/lib/dday";
import type { EarningsEvent, IpoEvent, SymbolInfo } from "../../src/types";
import { MOCK_SYMBOLS } from "../../src/mock/dummy";
import {
  type Env,
  fetchUsEarningsForSymbol,
  fetchUsEarningsForSymbols,
  fetchUsIpos,
  fetchUsProfile,
  fetchUsQuoteCore,
  US_INFO,
  US_SYMBOLS,
} from "./finnhub";
import { fetchNaverNews, type NaverEnv } from "./naver";
import { type DartEnv, fetchKrDisclosures, KR_CORP } from "./dart";
import { fetchKrQuote, type KrxEnv } from "./krx";
import { fetchKrEarnings, type YahooEnv } from "./yahoo";

// 검색·상세용 종목 마스터: KR mock + 미국 유니버스(88). 중복 심볼은 exchange가 있는 mock을 우선.
const SYMBOL_MASTER: SymbolInfo[] = [
  ...MOCK_SYMBOLS,
  ...US_INFO.filter((u) => !MOCK_SYMBOLS.some((m) => m.symbol === u.symbol)),
];

// 실데이터 소스: 미국 실적/IPO/시세=Finnhub, 국내 실적=Yahoo(비공식), 국내 시세=금융위 종가,
// 뉴스=네이버, 공시=DART. 국내 IPO/섹터는 무료 실소스가 없어 미노출.

interface WorkerEnv extends Env, NaverEnv, DartEnv, KrxEnv, YahooEnv {
  CACHE: KVNamespace;
}

/** 6자리 숫자면 국내 종목으로 간주(예: 005930). */
const isKr = (s: string) => /^\d{6}$/.test(s);

/**
 * KV 캐시(cache-aside). 미국 실적은 종목당 1콜씩 ~30콜이라 매 요청 fetch는 rate limit을 넘는다.
 * 캐시가 있으면 그대로, 없으면 producer 실행 후 ttlSec 동안 보관.
 */
async function cached<T>(env: WorkerEnv, key: string, ttlSec: number, producer: () => Promise<T>): Promise<T> {
  const hit = await env.CACHE.get<T>(key, "json");
  if (hit != null) return hit;
  const val = await producer();
  await env.CACHE.put(key, JSON.stringify(val), { expirationTtl: ttlSec });
  return val;
}

const IPO_TTL = 21600; // 6h
const KR_EARN_TTL = 21600; // 국내 실적일 6h (실적일은 자주 안 바뀜 + Yahoo 호출 절약)
const QUOTE_TTL = 60; // KV 최소 TTL. 장중 클라 폴링과 맞물려 ~1분 단위 갱신
const PROFILE_TTL = 86400; // 시총·통화는 장중 불변 → 24h
const KR_QUOTE_TTL = 3600; // 국내 종가(일별). 하루 1회 갱신이라 1h면 충분
const NEWS_TTL = 600; // 뉴스 10분 캐시 (네이버 25k/일 한도 여유)
const DISCLOSURE_TTL = 3600; // 공시 1시간 캐시 (DART 20k/일 한도 여유)

/** 뉴스 검색어: 종목이면 "이름 주가", 없으면 시장 전반. 이름은 종목 마스터에서 조회. */
function newsQuery(symbol?: string): string {
  if (!symbol) return "증시";
  // 종목명만으로 검색. "주가" 등 접미사는 관련도(sim)에서 오히려 노이즈를 끌어온다.
  return SYMBOL_MASTER.find((s) => s.symbol === symbol)?.name ?? symbol;
}

// 미국 실적: 종목당 1콜이라 유니버스 전체를 한 요청에 못 부른다(외부 fetch 50개/요청 한계).
// 25개씩 청크로 나눠 KV에 저장하고, 매 요청은 "가장 오래된 청크 1개"만 갱신한다.
// 3시간 지난 청크만 다시 부르므로 평소 Finnhub 호출은 0에 가깝다(rate limit 안전).
const CHUNK_SIZE = 25;
const CHUNK_STALE_MS = 3 * 3600_000;
const CHUNK_KEY_VER = "v3-kst"; // 데이터 형식 바뀌면 올려 캐시 무효화

interface ChunkCell {
  at: number;
  data: EarningsEvent[];
}

function usChunks(): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < US_SYMBOLS.length; i += CHUNK_SIZE) out.push(US_SYMBOLS.slice(i, i + CHUNK_SIZE));
  return out;
}

/** 청크 회전 캐시로 미국 실적을 모은다. Finnhub 실패·완전 콜드면 빈 배열. */
async function usEarnings(env: WorkerEnv): Promise<EarningsEvent[]> {
  const chunks = usChunks();
  const cells = await Promise.all(chunks.map((_, i) => env.CACHE.get<ChunkCell>(`earn:${CHUNK_KEY_VER}:${i}`, "json")));

  const now = Date.now();
  let stalest = 0;
  let worstAge = -1;
  cells.forEach((c, i) => {
    const age = c ? now - c.at : Infinity;
    if (age > worstAge) {
      worstAge = age;
      stalest = i;
    }
  });

  if (worstAge > CHUNK_STALE_MS) {
    try {
      const data = await fetchUsEarningsForSymbols(chunks[stalest], env);
      const cell: ChunkCell = { at: now, data };
      await env.CACHE.put(`earn:${CHUNK_KEY_VER}:${stalest}`, JSON.stringify(cell), { expirationTtl: 172800 });
      cells[stalest] = cell;
    } catch {
      // 갱신 실패 시 기존 청크 유지
    }
  }

  return cells.flatMap((c) => c?.data ?? []);
}

async function usIpos(env: WorkerEnv): Promise<IpoEvent[]> {
  try {
    return await cached(env, "us-ipos", IPO_TTL, () => fetchUsIpos(env));
  } catch {
    return [];
  }
}

/** 국내 유니버스(KR_CORP)의 다음 실적 발표일. Yahoo 실패 시 빈 배열. */
async function krEarnings(env: WorkerEnv): Promise<EarningsEvent[]> {
  try {
    return await cached(env, "kr-earn:v4", KR_EARN_TTL, () => fetchKrEarnings(Object.keys(KR_CORP), env));
  } catch {
    return [];
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** 공통 응답 봉투: 수집 시각(updatedAt) + data */
function json(data: unknown): Response {
  return new Response(JSON.stringify({ updatedAt: new Date().toISOString(), data }), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);
const upcoming = <T extends { date: string }>(list: T[]) => list.filter((x) => daysUntil(x.date) >= 0).sort(byDate);

/** `/` 안내 페이지용 엔드포인트 목록. 실제 라우트와 한 곳에서 관리한다. */
const ROUTES: { path: string; desc: string }[] = [
  { path: "/earnings/upcoming", desc: "다가오는 실적 발표 (전체)" },
  { path: "/earnings?symbol=AAPL", desc: "특정 종목의 실적 일정" },
  { path: "/quote?symbol=AAPL", desc: "종목 시세(미국=실시간 근사, 국내=전일 종가)" },
  { path: "/ipo", desc: "다가오는 공모주(IPO)" },
  { path: "/news", desc: "시장 뉴스 (또는 ?symbol=005930 종목 뉴스)" },
  { path: "/disclosures?symbol=005930", desc: "국내 종목 최근 공시 (DART)" },
  { path: "/symbols?q=삼성", desc: "종목 검색" },
];

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** 엔드포인트 목록 안내 HTML */
function indexHtml(): Response {
  const rows = ROUTES.map(
    (r) =>
      `<li><a href="${esc(r.path)}"><span class="m">GET</span> <code>${esc(r.path)}</code></a><span class="d">${esc(r.desc)}</span></li>`,
  ).join("");
  const body = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>stock-briefing-api</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#0f1115;color:#e6e6e6;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:40px 20px}
.wrap{max-width:640px;margin:0 auto}
h1{font-size:20px;margin:0 0 4px}
.sub{color:#8b8f98;font-size:13px;margin:0 0 24px}
ul{list-style:none;padding:0;margin:0}
li{padding:14px 16px;border:1px solid #23262d;border-radius:12px;margin-bottom:10px;background:#161a20}
a{text-decoration:none;color:#e6e6e6;display:flex;align-items:center;gap:8px}
a:hover code{color:#4b9fff}
.m{font-size:11px;font-weight:700;color:#3fb950;border:1px solid #2a4d33;border-radius:6px;padding:1px 6px}
code{color:#cdd3dc;font:13px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
.d{display:block;color:#8b8f98;font-size:13px;margin-top:6px}
footer{color:#5c616b;font-size:12px;margin-top:24px}
</style></head><body><div class="wrap">
<h1>📈 stock-briefing-api</h1>
<p class="sub">주식 브리핑 미니앱 백엔드 · 아래 경로를 눌러 응답을 확인하세요.</p>
<ul>${rows}</ul>
<footer>모든 응답은 <code>{ updatedAt, data }</code> 형식입니다.</footer>
</div></body></html>`;
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8", ...CORS } });
}

export default {
  async fetch(req: Request, env: WorkerEnv): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: CORS });

    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const symbol = url.searchParams.get("symbol") ?? undefined;
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

    switch (path) {
      case "/":
        return indexHtml();

      // 미국(Finnhub) + 국내(Yahoo) 실적을 병합해 임박순.
      case "/earnings/upcoming": {
        const [us, kr] = await Promise.all([usEarnings(env), krEarnings(env)]);
        return json(upcoming([...us, ...kr]));
      }

      // 특정 종목 실적 (상세 화면). 국내=Yahoo, 미국=Finnhub.
      case "/earnings": {
        if (!symbol) return json([]);
        if (isKr(symbol)) {
          try {
            return json(await cached(env, `kre3:${symbol}`, KR_EARN_TTL, () => fetchKrEarnings([symbol], env)));
          } catch {
            return json([]);
          }
        }
        try {
          return json((await fetchUsEarningsForSymbol(symbol, env)).sort(byDate));
        } catch {
          return json([]);
        }
      }

      // 종목 현재 시세. 미국=Finnhub(실시간 근사), 국내=금융위 종가(전일 기준).
      // 가격(코어)은 짧게(KV 하한 60s), 시총·통화(profile)는 길게 캐시해 Finnhub 콜을 아낀다.
      case "/quote": {
        if (!symbol) return json(null);
        if (isKr(symbol)) {
          try {
            return json(await cached(env, `krq:${symbol}`, KR_QUOTE_TTL, () => fetchKrQuote(symbol, env)));
          } catch {
            return json(null);
          }
        }
        try {
          const [core, prof] = await Promise.all([
            cached(env, `q:${symbol}`, QUOTE_TTL, () => fetchUsQuoteCore(symbol, env)),
            cached(env, `p:${symbol}`, PROFILE_TTL, () => fetchUsProfile(symbol, env)),
          ]);
          if (!core) return json(null);
          return json({ ...core, currency: prof?.currency ?? "USD", marketCap: prof?.marketCap });
        } catch {
          return json(null);
        }
      }

      // 미국(Finnhub 실데이터)만. 국내 IPO는 무료 실소스가 없어 미노출.
      case "/ipo":
        return json(upcoming(await usIpos(env)).slice(0, 50));

      // 종목 뉴스(?symbol=) 없으면 시장 뉴스. 네이버 검색 API, 실패 시 빈 배열.
      case "/news": {
        try {
          return json(
            await cached(env, `news:${symbol ?? "market"}`, NEWS_TTL, () =>
              fetchNaverNews(newsQuery(symbol), env, symbol),
            ),
          );
        } catch {
          return json([]);
        }
      }

      // 국내 종목 최근 공시(DART). 미국/유니버스 밖은 빈 배열. 실패 시에도 빈 배열(앱 안 죽음).
      case "/disclosures": {
        if (!symbol || !isKr(symbol)) return json([]);
        try {
          return json(await cached(env, `disc:${symbol}`, DISCLOSURE_TTL, () => fetchKrDisclosures(symbol, env)));
        } catch {
          return json([]);
        }
      }

      // 종목 검색 ?q=
      case "/symbols":
        return json(
          q === ""
            ? []
            : SYMBOL_MASTER.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q)).slice(
                0,
                20,
              ),
        );

      default:
        return new Response("Not Found", { status: 404, headers: CORS });
    }
  },
};
