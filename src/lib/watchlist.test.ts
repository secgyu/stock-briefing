import { describe, expect, it, vi } from "vitest";
import type { EarningsEvent, WatchItem } from "../types";

// watchlist → storage → 토스 SDK 체인이 node 환경에서 깨지지 않도록 목킹.
vi.mock("@apps-in-toss/web-framework", () => ({
  Storage: { getItem: async () => null, setItem: async () => {} },
}));

const { withNextEarnings } = await import("./watchlist");

const item = (symbol: string): WatchItem => ({ symbol, name: symbol, market: "US", addedAt: "" });
const earning = (symbol: string, date: string): EarningsEvent => ({
  symbol,
  name: symbol,
  market: "US",
  date,
  isEstimated: false,
  quarter: "",
});

describe("withNextEarnings", () => {
  // upcoming은 미래·오름차순 정렬돼 온다는 전제(워커 응답 규약).
  const upcoming = [earning("AAPL", "2026-07-10"), earning("MSFT", "2026-07-08"), earning("AAPL", "2026-10-10")];

  it("다음 실적이 가까운 순으로 정렬한다", () => {
    const out = withNextEarnings([item("AAPL"), item("MSFT")], upcoming);
    expect(out.map((r) => r.item.symbol)).toEqual(["MSFT", "AAPL"]);
  });

  it("같은 종목이 여러 건이면 첫(가장 이른) 실적을 쓴다", () => {
    const out = withNextEarnings([item("AAPL")], upcoming);
    expect(out[0].next?.date).toBe("2026-07-10");
  });

  it("일정 없는 종목은 뒤로 보낸다", () => {
    const out = withNextEarnings([item("TSLA"), item("MSFT")], upcoming);
    expect(out.map((r) => r.item.symbol)).toEqual(["MSFT", "TSLA"]);
    expect(out[1].next).toBeUndefined();
  });

  it("빈 입력이면 빈 배열", () => {
    expect(withNextEarnings([], upcoming)).toEqual([]);
  });
});
