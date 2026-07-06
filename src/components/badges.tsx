import { Badge, Text } from "@toss/tds-mobile";
import { changeColor, formatPct } from "../lib/format";
import { ddayLabel, isImminent } from "../lib/dday";

/** D-day 배지. D-7 이내(오늘 포함)는 빨강으로 임박 강조, 그 외엔 회색 */
export function DdayBadge({ date }: { date: string }) {
  const imminent = isImminent(date);
  return (
    <Badge size="small" variant={imminent ? "fill" : "weak"} color={imminent ? "red" : "elephant"}>
      {ddayLabel(date)}
    </Badge>
  );
}

/** 국내 미확정 발표일 표시 */
export function EstimatedBadge() {
  return (
    <Badge size="small" variant="weak" color="yellow">
      예상
    </Badge>
  );
}

/** 상승 빨강 / 하락 파랑 등락률 텍스트 */
export function ChangeRate({ pct, typography = "t6" }: { pct: number; typography?: "t5" | "t6" | "t7" }) {
  return (
    <Text typography={typography} fontWeight="bold" color={changeColor(pct)}>
      {formatPct(pct)}
    </Text>
  );
}
