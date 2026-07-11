import { describe, expect, it } from "vitest";
import { SYMBOL_MASTER } from "./index";
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
