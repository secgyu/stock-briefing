var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../src/lib/dday.ts
function daysUntil(dateStr, from = /* @__PURE__ */ new Date()) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const base = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target - base) / 864e5);
}
__name(daysUntil, "daysUntil");

// ../src/mock/dummy.ts
function dayOffset(n, base = /* @__PURE__ */ new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
__name(dayOffset, "dayOffset");
function hoursAgo(h, base = /* @__PURE__ */ new Date()) {
  return new Date(base.getTime() - h * 36e5).toISOString();
}
__name(hoursAgo, "hoursAgo");
var MOCK_EARNINGS = [
  {
    symbol: "AAPL",
    name: "\uC560\uD50C",
    market: "US",
    date: dayOffset(3),
    time: "AMC",
    isEstimated: false,
    quarter: "2026 Q3"
  },
  {
    symbol: "TSLA",
    name: "\uD14C\uC2AC\uB77C",
    market: "US",
    date: dayOffset(7),
    time: "AMC",
    isEstimated: false,
    quarter: "2026 Q2"
  },
  {
    symbol: "JNJ",
    name: "\uC874\uC2A8\uC564\uC874\uC2A8",
    market: "US",
    date: dayOffset(9),
    time: "BMO",
    isEstimated: false,
    quarter: "2026 Q2"
  },
  {
    symbol: "MSFT",
    name: "\uB9C8\uC774\uD06C\uB85C\uC18C\uD504\uD2B8",
    market: "US",
    date: dayOffset(4),
    time: "AMC",
    isEstimated: false,
    quarter: "2026 Q4"
  },
  {
    symbol: "KO",
    name: "\uCF54\uCE74\uCF5C\uB77C",
    market: "US",
    date: dayOffset(15),
    time: "BMO",
    isEstimated: false,
    quarter: "2026 Q2"
  },
  {
    symbol: "NVDA",
    name: "\uC5D4\uBE44\uB514\uC544",
    market: "US",
    date: dayOffset(45),
    time: "AMC",
    isEstimated: false,
    quarter: "2027 Q2"
  },
  { symbol: "005930", name: "\uC0BC\uC131\uC804\uC790", market: "KR", date: dayOffset(22), isEstimated: true, quarter: "2026 Q2" },
  { symbol: "000660", name: "SK\uD558\uC774\uB2C9\uC2A4", market: "KR", date: dayOffset(18), isEstimated: true, quarter: "2026 Q2" },
  { symbol: "035420", name: "NAVER", market: "KR", date: dayOffset(30), isEstimated: true, quarter: "2026 Q2" },
  { symbol: "035720", name: "\uCE74\uCE74\uC624", market: "KR", date: dayOffset(2), isEstimated: true, quarter: "2026 Q2" }
];
var MOCK_IPOS = [
  { symbol: void 0, name: "\uB808\uBAAC\uD5EC\uC2A4\uCF00\uC5B4", market: "KR", date: dayOffset(0), isEstimated: false },
  { symbol: void 0, name: "\uBDF0\uD2F0\uD14C\uD06C", market: "KR", date: dayOffset(2), isEstimated: true },
  { symbol: "FIG", name: "Figma", market: "US", date: dayOffset(4), isEstimated: false },
  { symbol: "DBX2", name: "Databricks", market: "US", date: dayOffset(9), isEstimated: false }
];
var MOCK_SECTORS = [
  { rank: 1, name: "\uC870\uC120", market: "KR", weeklyChangePct: 5.1 },
  { rank: 2, name: "\uBC18\uB3C4\uCCB4", market: "KR", weeklyChangePct: 4.2 },
  { rank: 3, name: "Technology", market: "US", weeklyChangePct: 3.1 },
  { rank: 4, name: "\uC790\uB3D9\uCC28", market: "KR", weeklyChangePct: 2.3 },
  { rank: 5, name: "\uBC14\uC774\uC624", market: "KR", weeklyChangePct: 0.8 },
  { rank: 6, name: "2\uCC28\uC804\uC9C0", market: "KR", weeklyChangePct: -1.1 },
  { rank: 7, name: "Energy", market: "US", weeklyChangePct: -2.4 }
];
var MOCK_MARKET_NEWS = [
  {
    title: "\uCF54\uC2A4\uD53C, \uC678\uAD6D\uC778 \uB9E4\uC218\uC138\uC5D0 2\uB144 \uB9CC\uC5D0 \uCD5C\uACE0\uCE58 \uACBD\uC2E0",
    source: "\uC5F0\uD569\uB274\uC2A4",
    publishedAt: hoursAgo(1),
    url: "https://example.com/news/1"
  },
  {
    title: "\uBBF8 \uC5F0\uC900, \uAE08\uB9AC \uB3D9\uACB0 \uC2DC\uC0AC\u2026 \uAE30\uC220\uC8FC \uAC15\uC138",
    source: "\uD55C\uAD6D\uACBD\uC81C",
    publishedAt: hoursAgo(3),
    url: "https://example.com/news/2"
  },
  {
    title: "\uBC18\uB3C4\uCCB4 \uC5C5\uD669 \uD68C\uBCF5 \uC2E0\uD638\u2026 \uC218\uCD9C \uC9C0\uD45C \uAC1C\uC120",
    source: "\uB9E4\uC77C\uACBD\uC81C",
    publishedAt: hoursAgo(5),
    url: "https://example.com/news/3"
  },
  {
    title: "\uAD6D\uB0B4 IPO \uC2DC\uC7A5 \uD65C\uAE30\u2026 \uD558\uBC18\uAE30 \uB300\uC5B4 \uC904\uC904\uC774 \uB300\uAE30",
    source: "\uC774\uB370\uC77C\uB9AC",
    publishedAt: hoursAgo(8),
    url: "https://example.com/news/4"
  },
  {
    title: "\uC774\uBC88 \uC8FC \uC2E4\uC801 \uBC1C\uD45C \uC55E\uB454 \uBE45\uD14C\uD06C \uC8FC\uBAA9",
    source: "\uBA38\uB2C8\uD22C\uB370\uC774",
    publishedAt: hoursAgo(11),
    url: "https://example.com/news/5"
  }
];
var SYMBOL_NEWS = {
  AAPL: [
    {
      title: "\uC560\uD50C, \uC2E0\uD615 \uC544\uC774\uD3F0 \uACF5\uAC1C \uC55E\uB450\uACE0 \uBD80\uD488 \uC218\uAE09 \uD655\uB300",
      source: "Bloomberg",
      publishedAt: hoursAgo(2),
      url: "https://example.com/aapl/1",
      symbol: "AAPL"
    },
    {
      title: "\uC560\uD50C \uC11C\uBE44\uC2A4 \uB9E4\uCD9C \uC0AC\uC0C1 \uCD5C\uB300 \uC804\uB9DD",
      source: "Reuters",
      publishedAt: hoursAgo(20),
      url: "https://example.com/aapl/2",
      symbol: "AAPL"
    }
  ],
  "005930": [
    {
      title: "\uC0BC\uC131\uC804\uC790, HBM \uACF5\uAE09 \uD655\uB300\uB85C \uBC18\uB3C4\uCCB4 \uC2E4\uC801 \uAC1C\uC120 \uAE30\uB300",
      source: "\uC5F0\uD569\uB274\uC2A4",
      publishedAt: hoursAgo(4),
      url: "https://example.com/sec/1",
      symbol: "005930"
    },
    {
      title: "\uC0BC\uC131\uC804\uC790 2\uBD84\uAE30 \uC7A0\uC815\uC2E4\uC801 \uBC1C\uD45C \uC784\uBC15",
      source: "\uD55C\uAD6D\uACBD\uC81C",
      publishedAt: hoursAgo(26),
      url: "https://example.com/sec/2",
      symbol: "005930"
    }
  ]
};
function mockNewsFor(symbol) {
  if (!symbol) return MOCK_MARKET_NEWS;
  return SYMBOL_NEWS[symbol] ?? [];
}
__name(mockNewsFor, "mockNewsFor");
var MOCK_SYMBOLS = [
  { symbol: "005930", name: "\uC0BC\uC131\uC804\uC790", market: "KR", exchange: "KOSPI" },
  { symbol: "000660", name: "SK\uD558\uC774\uB2C9\uC2A4", market: "KR", exchange: "KOSPI" },
  { symbol: "035420", name: "NAVER", market: "KR", exchange: "KOSPI" },
  { symbol: "035720", name: "\uCE74\uCE74\uC624", market: "KR", exchange: "KOSPI" },
  { symbol: "005380", name: "\uD604\uB300\uCC28", market: "KR", exchange: "KOSPI" },
  { symbol: "373220", name: "LG\uC5D0\uB108\uC9C0\uC194\uB8E8\uC158", market: "KR", exchange: "KOSPI" },
  { symbol: "AAPL", name: "\uC560\uD50C", market: "US", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "\uB9C8\uC774\uD06C\uB85C\uC18C\uD504\uD2B8", market: "US", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "\uD14C\uC2AC\uB77C", market: "US", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "\uC5D4\uBE44\uB514\uC544", market: "US", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "\uC54C\uD30C\uBCB3", market: "US", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "\uC544\uB9C8\uC874", market: "US", exchange: "NASDAQ" },
  { symbol: "JNJ", name: "\uC874\uC2A8\uC564\uC874\uC2A8", market: "US", exchange: "NYSE" },
  { symbol: "KO", name: "\uCF54\uCE74\uCF5C\uB77C", market: "US", exchange: "NYSE" }
];
var DEFAULT_WATCHLIST = [
  { symbol: "AAPL", name: "\uC560\uD50C", market: "US", addedAt: hoursAgo(48) },
  { symbol: "005930", name: "\uC0BC\uC131\uC804\uC790", market: "KR", addedAt: hoursAgo(24) }
];

// src/index.ts
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function json(data) {
  return new Response(JSON.stringify({ updatedAt: (/* @__PURE__ */ new Date()).toISOString(), data }), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS }
  });
}
__name(json, "json");
var byDate = /* @__PURE__ */ __name((a, b) => a.date.localeCompare(b.date), "byDate");
var upcoming = /* @__PURE__ */ __name((list) => list.filter((x) => daysUntil(x.date) >= 0).sort(byDate), "upcoming");
var src_default = {
  fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: CORS });
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const symbol = url.searchParams.get("symbol") ?? void 0;
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
          q === "" ? [] : MOCK_SYMBOLS.filter(
            (s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q)
          ).slice(0, 20)
        );
      default:
        return new Response("Not Found", { status: 404, headers: CORS });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Y1QDJh/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Y1QDJh/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
