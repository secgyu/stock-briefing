import { adaptive } from "@toss/tds-colors";
import { ListRow, Text } from "@toss/tds-mobile";
import type { ReactNode } from "react";
import { earningsTimeLabel, marketFlag, relativeTime } from "../lib/format";
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
      left={<StockAvatar name={event.name} seed={event.symbol} />}
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
      left={<StockAvatar name={ipo.name} seed={ipo.symbol ?? ipo.name} />}
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

export function SectorRow({ sector }: { sector: SectorRank }) {
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
        <Text typography="t6" fontWeight="bold" color={adaptive.grey900}>
          {marketFlag(sector.market)} {sector.name}
        </Text>
      }
      right={<ChangeRate pct={sector.weeklyChangePct} />}
    />
  );
}

export function NewsRow({ news, onClick }: { news: NewsItem; onClick: () => void }) {
  return (
    <ListRow
      onClick={onClick}
      withTouchEffect
      arrowType="right"
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
