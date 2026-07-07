import { adaptive } from "@toss/tds-colors";
import { ListRow, Text } from "@toss/tds-mobile";
import type { ReactNode } from "react";
import { changeColor, earningsTimeLabel, marketFlag, relativeTime } from "../lib/format";
import { logoCandidates } from "../lib/logo";
import type { EarningsEvent, IpoEvent, NewsItem, SectorRank } from "../types";
import { ChangeRate, DdayBadge, EstimatedBadge } from "./badges";
import { StarIcon } from "./icons";
import { StockAvatar } from "./StockAvatar";

function Subline({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>{children}</div>;
}

function NameLine({ name }: { name: string }) {
  return (
    <Text typography="t6" fontWeight="bold" color={adaptive.grey900}>
      {name}
    </Text>
  );
}

/** 별표 토글 버튼 */
export function StarToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={on ? "관심 해제" : "관심 등록"}
      style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}
    >
      <StarIcon color={on ? adaptive.yellow500 : adaptive.grey300} filled={on} size={22} />
    </button>
  );
}

export function EarningsRow({
  event,
  watched,
  onToggle,
  onClick,
}: {
  event: EarningsEvent;
  watched?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}) {
  const timeLabel = earningsTimeLabel(event.time);
  return (
    <ListRow
      onClick={onClick}
      withTouchEffect={onClick != null}
      left={<StockAvatar name={event.name} seed={event.symbol} logoUrls={logoCandidates(event.symbol, event.market)} />}
      contents={
        <div>
          <NameLine name={event.name} />
          <Subline>
            <Text typography="t7" color={adaptive.grey500}>
              {marketFlag(event.market)} {event.quarter}
              {timeLabel != null ? ` · ${timeLabel}` : ""}
            </Text>
            {event.isEstimated && <EstimatedBadge />}
          </Subline>
        </div>
      }
      right={
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <DdayBadge date={event.date} />
          {onToggle != null && <StarToggle on={watched ?? false} onClick={onToggle} />}
        </div>
      }
    />
  );
}

export function IpoRow({ ipo }: { ipo: IpoEvent }) {
  return (
    <ListRow
      left={
        <StockAvatar name={ipo.name} seed={ipo.symbol ?? ipo.name} logoUrls={logoCandidates(ipo.symbol, ipo.market)} />
      }
      contents={
        <div>
          <NameLine name={ipo.name} />
          <Subline>
            <Text typography="t7" color={adaptive.grey500}>
              {marketFlag(ipo.market)} 신규 상장
            </Text>
            {ipo.isEstimated && <EstimatedBadge />}
          </Subline>
        </div>
      }
      right={<DdayBadge date={ipo.date} />}
    />
  );
}

// 약세장(모든 산업 소폭)일 때 막대가 과장되지 않도록 두는 최소 정규화 기준.
// 그 주 최대 |등락률|이 이보다 작으면 이 값으로 나눠 막대를 짧게 유지한다.
const SECTOR_MIN_SCALE = 3;

export function SectorRow({ sector, maxAbs }: { sector: SectorRank; maxAbs: number }) {
  const pct = sector.weeklyChangePct;
  // 그 주 최대값 기준 상대 정규화 → 값이 아무리 커도 막대는 100%를 넘지 않는다.
  const denom = Math.max(maxAbs, SECTOR_MIN_SCALE);
  const width = Math.min(Math.abs(pct) / denom, 1) * 100;
  return (
    <ListRow
      left={
        <div style={{ width: 24, textAlign: "center" }}>
          <Text typography="t5" fontWeight="bold" color={adaptive.grey400}>
            {sector.rank}
          </Text>
        </div>
      }
      contents={
        <div>
          <Text typography="t6" fontWeight="bold" color={adaptive.grey900}>
            {marketFlag(sector.market)} {sector.name}
          </Text>
          <div
            style={{
              marginTop: 6,
              width: 132,
              maxWidth: "100%",
              height: 6,
              borderRadius: 3,
              background: adaptive.grey100,
              overflow: "hidden",
            }}
          >
            <div style={{ height: "100%", width: `${width}%`, background: changeColor(pct), borderRadius: 3 }} />
          </div>
        </div>
      }
      right={<ChangeRate pct={pct} />}
    />
  );
}

export function NewsRow({ news, onClick }: { news: NewsItem; onClick: () => void }) {
  return (
    <ListRow
      onClick={onClick}
      withTouchEffect
      arrowType="right"
      left={<StockAvatar name={news.source} seed={news.source} size={40} />}
      contents={
        <div>
          <Text typography="t6" fontWeight="medium" color={adaptive.grey900} ellipsisAfterLines={2}>
            {news.title}
          </Text>
          <Subline>
            <Text typography="t7" color={adaptive.grey500}>
              {news.source} · {relativeTime(news.publishedAt)}
            </Text>
          </Subline>
        </div>
      }
    />
  );
}
