import { describe, expect, it } from "vitest";
import { daysUntil, ddayLabel, ddayTier } from "./dday";

const today = new Date(2026, 6, 6); // 2026-07-06 (로컬)

describe("daysUntil", () => {
  it("오늘은 0", () => expect(daysUntil("2026-07-06", today)).toBe(0));
  it("미래는 양수", () => expect(daysUntil("2026-07-09", today)).toBe(3));
  it("과거는 음수", () => expect(daysUntil("2026-07-01", today)).toBe(-5));
  it("월 경계를 넘어도 정확", () => expect(daysUntil("2026-08-06", today)).toBe(31));
});

describe("ddayLabel", () => {
  it("오늘=D-DAY", () => expect(ddayLabel("2026-07-06", today)).toBe("D-DAY"));
  it("미래=D-n", () => expect(ddayLabel("2026-07-09", today)).toBe("D-3"));
  it("과거=D+n", () => expect(ddayLabel("2026-07-01", today)).toBe("D+5"));
});

describe("ddayTier", () => {
  it("D-0 ~ D-2는 임박", () => {
    expect(ddayTier("2026-07-06", today)).toBe("imminent");
    expect(ddayTier("2026-07-08", today)).toBe("imminent");
  });
  it("D-3 ~ D-7은 근접", () => {
    expect(ddayTier("2026-07-09", today)).toBe("near");
    expect(ddayTier("2026-07-13", today)).toBe("near");
  });
  it("D-8 이상·과거는 far", () => {
    expect(ddayTier("2026-07-14", today)).toBe("far");
    expect(ddayTier("2026-07-05", today)).toBe("far");
  });
});
