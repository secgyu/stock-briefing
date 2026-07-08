import { daysUntil } from "../../src/lib/dday";
import { buildEarnings, buildIpos, MOCK_SECTORS, MOCK_SYMBOLS, mockNewsFor } from "../../src/mock/dummy";

// ponytail: P3는 프론트 mock을 그대로 재사용해 응답만 흉내낸다. P4에서 프론트가
// 이 Worker를 호출하도록 바꾸고, P5에서 이 mock을 KV 캐시(실데이터)로 교체한다.
// 상대 날짜 mock은 반드시 builder(buildEarnings 등)를 요청 시점에 호출한다.
// Workers는 모듈 로드 시 new Date()=epoch(0)이라 eager 상수를 쓰면 날짜가 1970이 된다.

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
  { path: "/ipo", desc: "다가오는 공모주(IPO)" },
  { path: "/sectors", desc: "산업별 주간 등락률" },
  { path: "/news", desc: "시장 뉴스 (또는 ?symbol=005930 종목 뉴스)" },
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
  fetch(req: Request): Response {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: CORS });

    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const symbol = url.searchParams.get("symbol") ?? undefined;
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

    switch (path) {
      case "/":
        return indexHtml();

      case "/earnings/upcoming":
        return json(upcoming(buildEarnings()).slice(0, 50));

      // 특정 종목 실적 (상세 화면). ?symbol=AAPL
      case "/earnings":
        return json(
          buildEarnings()
            .filter((e) => e.symbol === symbol)
            .sort(byDate),
        );

      case "/ipo":
        return json(upcoming(buildIpos()).slice(0, 50));

      case "/sectors":
        return json(MOCK_SECTORS);

      // 종목 뉴스(?symbol=) 없으면 시장 뉴스
      case "/news":
        return json(mockNewsFor(symbol));

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
