import { describe, expect, it } from "vitest";
import { isKr, isKrMarketOpen, isUsMarketOpen } from "./market";

describe("isKr", () => {
  it("6자리 숫자는 국내", () => expect(isKr("005930")).toBe(true));
  it("티커는 해외", () => expect(isKr("AAPL")).toBe(false));
  it("5자리 숫자는 아님", () => expect(isKr("12345")).toBe(false));
});

// 2026-07-06은 월요일. 7월 뉴욕은 EDT(UTC-4), 서울은 UTC+9.
const utc = (h: number, m: number, day = 6) => new Date(Date.UTC(2026, 6, day, h, m));

describe("isUsMarketOpen (09:30–16:00 ET)", () => {
  it("장중이면 open", () => expect(isUsMarketOpen(utc(14, 30))).toBe(true)); // 10:30 ET
  it("개장 직전이면 closed", () => expect(isUsMarketOpen(utc(13, 29))).toBe(false)); // 09:29 ET
  it("개장 시각 정각은 open", () => expect(isUsMarketOpen(utc(13, 30))).toBe(true)); // 09:30 ET
  it("마감 시각 정각은 closed", () => expect(isUsMarketOpen(utc(20, 0))).toBe(false)); // 16:00 ET
  it("주말은 closed", () => expect(isUsMarketOpen(utc(15, 0, 11))).toBe(false)); // 토요일
});

describe("isKrMarketOpen (09:00–15:30 KST)", () => {
  it("개장 시각 정각은 open", () => expect(isKrMarketOpen(utc(0, 0))).toBe(true)); // 09:00 KST
  it("개장 직전이면 closed", () => expect(isKrMarketOpen(utc(23, 59, 5))).toBe(false)); // 월 08:59 KST
  it("마감 직전은 open", () => expect(isKrMarketOpen(utc(6, 29))).toBe(true)); // 15:29 KST
  it("마감 시각 정각은 closed", () => expect(isKrMarketOpen(utc(6, 30))).toBe(false)); // 15:30 KST
  it("주말은 closed", () => expect(isKrMarketOpen(utc(3, 0, 12))).toBe(false)); // 일요일
});
