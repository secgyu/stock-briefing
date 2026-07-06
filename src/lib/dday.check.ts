/**
 * dday 로직 자체 점검. 프레임워크 없이 node:assert로 확인한다.
 * 실행: npx tsx src/lib/dday.check.ts
 */
import assert from "node:assert";
import { daysUntil, ddayLabel, isImminent } from "./dday";

const today = new Date(2026, 6, 6); // 2026-07-06 (로컬)

assert.strictEqual(daysUntil("2026-07-06", today), 0, "오늘은 0일");
assert.strictEqual(daysUntil("2026-07-09", today), 3, "3일 후");
assert.strictEqual(daysUntil("2026-07-01", today), -5, "5일 전");
assert.strictEqual(daysUntil("2026-08-06", today), 31, "한 달 후");

assert.strictEqual(ddayLabel("2026-07-06", today), "D-DAY");
assert.strictEqual(ddayLabel("2026-07-09", today), "D-3");
assert.strictEqual(ddayLabel("2026-07-01", today), "D+5");

assert.strictEqual(isImminent("2026-07-09", today), true, "3일 후는 임박");
assert.strictEqual(isImminent("2026-07-13", today), true, "7일 후는 임박");
assert.strictEqual(isImminent("2026-07-14", today), false, "8일 후는 임박 아님");
assert.strictEqual(isImminent("2026-07-05", today), false, "과거는 임박 아님");

console.log("dday.check: 모든 검증 통과");
