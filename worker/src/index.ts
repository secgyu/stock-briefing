import { daysUntil } from "../../src/lib/dday";
import {
  MOCK_EARNINGS,
  MOCK_IPOS,
  MOCK_MARKET_NEWS,
  MOCK_SECTORS,
  MOCK_SYMBOLS,
  mockNewsFor,
} from "../../src/mock/dummy";

// ponytail: P3는 프론트 mock을 그대로 재사용해 응답만 흉내낸다. P4에서 프론트가
// 이 Worker를 호출하도록 바꾸고, P5에서 이 mock을 KV 캐시(실데이터)로 교체한다.

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

export default {
  fetch(req: Request): Response {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: CORS });

    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const symbol = url.searchParams.get("symbol") ?? undefined;
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

    switch (path) {
      case "/":
        return json({ ok: true, service: "stock-briefing-api" });

      case "/earnings/upcoming":
        return json(upcoming(MOCK_EARNINGS).slice(0, 50));

      // 특정 종목 실적 (상세 화면). ?symbol=AAPL
      case "/earnings":
        return json(MOCK_EARNINGS.filter((e) => e.symbol === symbol).sort(byDate));

      case "/ipo":
        return json(upcoming(MOCK_IPOS).slice(0, 50));

      case "/sectors":
        return json(MOCK_SECTORS);

      // 종목 뉴스(?symbol=) 없으면 시장 뉴스
      case "/news":
        return json(symbol ? mockNewsFor(symbol) : MOCK_MARKET_NEWS);

      // 종목 검색 ?q=
      case "/symbols":
        return json(
          q === ""
            ? []
            : MOCK_SYMBOLS.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q)).slice(
                0,
                20,
              ),
        );

      default:
        return new Response("Not Found", { status: 404, headers: CORS });
    }
  },
};
