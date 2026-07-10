/** 6자리 숫자면 국내 종목(예: 005930). */
export const isKr = (symbol: string): boolean => /^\d{6}$/.test(symbol);

// ponytail: 증시 공휴일(휴장)은 반영하지 않음 — 휴장일엔 폴링이 몇 번 헛돌 뿐(종가만 반환)이라 무해.
// DST는 타임존으로 Intl이 자동 처리한다.
function marketOpen(now: Date, timeZone: string, startMin: number, endMin: number): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  return mins >= startMin && mins < endMin;
}

/** 미국 정규장(평일 09:30–16:00 ET) 개장 여부 */
export const isUsMarketOpen = (now: Date = new Date()): boolean =>
  marketOpen(now, "America/New_York", 9 * 60 + 30, 16 * 60);

/** 국내 정규장(평일 09:00–15:30 KST) 개장 여부 */
export const isKrMarketOpen = (now: Date = new Date()): boolean => marketOpen(now, "Asia/Seoul", 9 * 60, 15 * 60 + 30);
