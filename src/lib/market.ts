/**
 * 미국 정규장(평일 09:30–16:00 ET) 개장 여부.
 * DST는 America/New_York 타임존으로 Intl이 자동 처리한다.
 * ponytail: 미국 증시 공휴일(휴장)은 반영하지 않음 — 휴장일엔 폴링이 몇 번 헛돌 뿐(종가만 반환)이라 무해.
 */
export function isUsMarketOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  return mins >= 9 * 60 + 30 && mins < 16 * 60;
}

/**
 * 국내 정규장(평일 09:00–15:30 KST) 개장 여부.
 * ponytail: 한국 증시 공휴일(휴장)은 반영하지 않음 — 휴장일엔 폴링이 몇 번 헛돌 뿐이라 무해.
 */
export function isKrMarketOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  return mins >= 9 * 60 && mins < 15 * 60 + 30;
}
