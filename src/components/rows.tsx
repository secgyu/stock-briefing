import { adaptive } from "@toss/tds-colors";
import { ListRow, Text } from "@toss/tds-mobile";
import type { ReactNode } from "react";
import { earningsTimeLabel, marketFlag, relativeTime } from "../lib/format";
import { logoCandidates } from "../lib/logo";
import type { EarningsEvent, IpoEvent, NewsItem } from "../types";
import { DdayBadge, EstimatedBadge } from "./badges";
import { StarIcon } from "./icons";
import { PlainButton } from "./layout";
import { StockAvatar } from "./StockAvatar";

export function Subline({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>{children}</div>;
}

export function NameLine({ name, fontWeight = "bold" }: { name: string; fontWeight?: "bold" | "medium" }) {
  return (
    <Text typography="t6" fontWeight={fontWeight} color={adaptive.grey900}>
      {name}
    </Text>
  );
}

/** 리스트 행의 "제목 + 회색 부제" 두 줄 콘텐츠 */
export function TwoLine({ title, sub, fontWeight }: { title: string; sub: ReactNode; fontWeight?: "bold" | "medium" }) {
  return (
    <div>
      <NameLine name={title} fontWeight={fontWeight} />
      <Subline>
        <Text typography="t7" color={adaptive.grey500}>
          {sub}
        </Text>
      </Subline>
    </div>
  );
}

export function StarToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <PlainButton
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={on ? "관심 해제" : "관심 등록"}
    >
      <StarIcon color={on ? adaptive.yellow500 : adaptive.grey300} filled={on} size={22} />
    </PlainButton>
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
