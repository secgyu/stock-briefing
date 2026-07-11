import { afterEach, describe, expect, it, vi } from "vitest";
import { SYMBOL_MASTER, upcoming } from "./index";
import { KR_CORP } from "./dart";
import { US_SYMBOLS } from "./finnhub";

// 회귀 방지: KR_CORP(공시·실적 유니버스)가 마스터에 빠지면
// 캘린더엔 뜨는데 검색·상세·종목뉴스가 안 되는 정합성 버그가 재발한다.
describe("SYMBOL_MASTER", () => {
  it("KR_CORP 전 종목 포함", () => {
    const symbols = new Set(SYMBOL_MASTER.map((s) => s.symbol));
    for (const code of Object.keys(KR_CORP)) expect(symbols.has(code), code).toBe(true);
  });

  it("미국 유니버스 전 종목 포함", () => {
    const symbols = new Set(SYMBOL_MASTER.map((s) => s.symbol));
    for (const t of US_SYMBOLS) expect(symbols.has(t), t).toBe(true);
  });

  it("심볼 중복 없음", () => {
    const symbols = SYMBOL_MASTER.map((s) => s.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it("이름·마켓 채워짐", () => {
    for (const s of SYMBOL_MASTER) {
      expect(s.name.length, s.symbol).toBeGreaterThan(0);
      expect(["KR", "US"]).toContain(s.market);
    }
  });
});

// 워커는 UTC로 돌지만 앱 날짜는 KST 기준 → 필터도 KST 오늘이어야 한다.
describe("upcoming (KST 기준 필터)", () => {
  afterEach(() => vi.useRealTimers());

  it("KST 새벽(UTC는 아직 어제)엔 KST 기준 어제 일정을 제외한다", () => {
    vi.useFakeTimers();
    // UTC 2026-07-10 17:00 = KST 2026-07-11 02:00
    vi.setSystemTime(new Date("2026-07-10T17:00:00Z"));
    const out = upcoming([{ date: "2026-07-10" }, { date: "2026-07-11" }, { date: "2026-07-12" }]);
    expect(out.map((x) => x.date)).toEqual(["2026-07-11", "2026-07-12"]);
  });

  it("오늘(KST) 일정은 포함하고 임박순 정렬한다", () => {
    vi.useFakeTimers();
    // UTC 2026-07-11 01:00 = KST 2026-07-11 10:00
    vi.setSystemTime(new Date("2026-07-11T01:00:00Z"));
    const out = upcoming([{ date: "2026-07-20" }, { date: "2026-07-11" }]);
    expect(out.map((x) => x.date)).toEqual(["2026-07-11", "2026-07-20"]);
  });
});
