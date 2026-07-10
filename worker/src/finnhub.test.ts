import { describe, expect, it } from "vitest";
import { toKstDate } from "./finnhub";

describe("toKstDate (미국 실적일 → KST 날짜)", () => {
  it("장 마감 후(amc)는 KST 기준 다음날", () => expect(toKstDate("2026-07-08", "amc")).toBe("2026-07-09"));
  it("개장 전(bmo)은 같은 날", () => expect(toKstDate("2026-07-08", "bmo")).toBe("2026-07-08"));
  it("시각 미상도 같은 날", () => expect(toKstDate("2026-07-08")).toBe("2026-07-08"));
  it("월말 amc는 다음 달로 넘어간다", () => expect(toKstDate("2026-07-31", "amc")).toBe("2026-08-01"));
  it("연말 amc는 다음 해로 넘어간다", () => expect(toKstDate("2026-12-31", "amc")).toBe("2027-01-01"));
});
