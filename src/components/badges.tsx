import { Badge, Text } from "@toss/tds-mobile";
import { changeColor, formatPct } from "../lib/format";
import { ddayLabel, ddayTier } from "../lib/dday";

const DDAY_STYLE = {
  imminent: { variant: "fill", color: "red" },
  near: { variant: "weak", color: "blue" },
  far: { variant: "weak", color: "elephant" },
} as const;

/** D-day 배지. 임박(≤D-2) 빨강, 근접(D-3~D-7) 블루, 그 외 회색 */
export function DdayBadge({ date }: { date: string }) {
  const { variant, color } = DDAY_STYLE[ddayTier(date)];
  return (
    <Badge size="small" variant={variant} color={color}>
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
