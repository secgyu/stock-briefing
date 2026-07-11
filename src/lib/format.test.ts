import { describe, expect, it } from "vitest";
import { formatMarketCap, formatPct, formatPrice } from "./format";

describe("formatPct", () => {
  it("상승은 + 부호", () => expect(formatPct(4.23)).toBe("+4.2%"));
  it("하락은 - 부호", () => expect(formatPct(-1.15)).toBe("-1.1%"));
  it("보합은 부호 없음", () => expect(formatPct(0)).toBe("0.0%"));
});

describe("formatPrice", () => {
  it("KRW는 정수 + 원", () => expect(formatPrice(73000.4, "KRW")).toBe("73,000원"));
  it("USD는 소수 2자리 + $", () => expect(formatPrice(1234.5, "USD")).toBe("$1,234.50"));
  it("기타 통화는 코드 병기", () => expect(formatPrice(10, "JPY")).toBe("10.00 JPY"));
  it("음수는 부호가 통화기호 앞", () => {
    expect(formatPrice(-12.3, "USD")).toBe("-$12.30");
    expect(formatPrice(-10500, "KRW")).toBe("-10,500원");
  });
});

describe("formatMarketCap (USD, 백만 단위 입력)", () => {
  it("1조 달러 이상은 T", () => expect(formatMarketCap(3_450_000, "USD")).toBe("$3.45T"));
  it("10억 달러 이상은 B", () => expect(formatMarketCap(1_234, "USD")).toBe("$1.2B"));
  it("그 미만은 M", () => expect(formatMarketCap(456, "USD")).toBe("$456M"));
});

describe("formatMarketCap (KRW, 원 단위 입력)", () => {
  it("1조 이상은 조원", () => expect(formatMarketCap(400.1e12, "KRW")).toBe("400.1조원"));
  it("1억 이상은 억원", () => expect(formatMarketCap(3_456e8, "KRW")).toBe("3,456억원"));
  it("경계: 정확히 1조", () => expect(formatMarketCap(1e12, "KRW")).toBe("1.0조원"));
});

describe("formatMarketCap (없거나 0)", () => {
  it("null 반환", () => {
    expect(formatMarketCap(undefined)).toBeNull();
    expect(formatMarketCap(0, "KRW")).toBeNull();
  });
});
