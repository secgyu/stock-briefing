import { adaptive } from "@toss/tds-colors";
import { Button, ListRow, Text, Top } from "@toss/tds-mobile";
import { api } from "../api/client";
import { daysUntil } from "../lib/dday";
import { openExternal } from "../lib/external";
import { earningsTimeLabel, formatDateKo, marketFlag } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import type { UseWatchlist } from "../lib/watchlist";
import { DdayBadge, EstimatedBadge } from "../components/badges";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { NewsRow } from "../components/rows";
import { EmptyState, ErrorState, ListSkeleton } from "../components/states";
import { ChevronRightIcon } from "../components/icons";
import type { EarningsEvent, NewsItem, SymbolInfo } from "../types";

const DART_SEARCH = "https://dart.fss.or.kr/dsab007/main.do";

interface DetailData {
  info?: SymbolInfo;
  next?: EarningsEvent;
  news: NewsItem[];
}

async function loadDetail(symbol: string): Promise<DetailData> {
  const [symbols, earnings, news] = await Promise.all([api.symbols(symbol), api.earnings(symbol), api.news(symbol)]);
  const today = new Date();
  const next = earnings.filter((e) => daysUntil(e.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  return { info: symbols.find((s) => s.symbol === symbol), next, news };
}

export function StockDetailScreen({
  symbol,
  watchlist,
  onBack,
}: {
  symbol: string;
  watchlist: UseWatchlist;
  onBack: () => void;
}) {
  const { status, data, retry } = useAsync(() => loadDetail(symbol), [symbol]);
  const watched = watchlist.isWatched(symbol);

  if (status === "loading") {
    return (
      <Screen>
        <BackBar onBack={onBack} />
        <ListSkeleton rows={4} />
      </Screen>
    );
  }

  if (status === "error") {
    return (
      <Screen>
        <BackBar onBack={onBack} />
        <ErrorState onRetry={retry} />
      </Screen>
    );
  }

  const info = data?.info;
  const next = data?.next;
  const news = data?.news ?? [];

  if (!info) {
    return (
      <Screen>
        <BackBar onBack={onBack} />
        <EmptyState title="종목 정보를 찾을 수 없어요" actionLabel="돌아가기" onAction={onBack} />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackBar onBack={onBack} />
      <Top
        title={<Top.TitleParagraph size={22}>{info.name}</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            {marketFlag(info.market)} {info.symbol} · {info.exchange}
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "4px 24px 16px" }}>
        <Button
          size="medium"
          variant={watched ? "weak" : "fill"}
          display="block"
          onClick={() => watchlist.toggle({ symbol: info.symbol, name: info.name, market: info.market })}
        >
          {watched ? "관심 해제" : "관심 등록"}
        </Button>
      </div>

      <SectionCard>
        <SectionHeader title="다음 실적발표" />
        {next ? (
          <ListRow
            left={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <DdayBadge date={next.date} />
              </div>
            }
            contents={
              <div>
                <Text typography="t6" fontWeight="bold" color={adaptive.grey900}>
                  {formatDateKo(next.date)}
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Text typography="t7" color={adaptive.grey500}>
                    {next.quarter}
                    {earningsTimeLabel(next.time) != null ? ` · ${earningsTimeLabel(next.time)}` : ""}
                  </Text>
                  {next.isEstimated && <EstimatedBadge />}
                </div>
              </div>
            }
          />
        ) : (
          <EmptyState title="예정된 실적발표 일정이 없어요" />
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="종목 뉴스" />
        {news.length === 0 ? (
          <EmptyState title="관련 뉴스가 없어요" />
        ) : (
          news.map((n) => <NewsRow key={n.url} news={n} onClick={() => openExternal(n.url)} />)
        )}
      </SectionCard>

      {info.market === "KR" && (
        <SectionCard>
          <SectionHeader title="최근 공시" />
          <ListRow
            onClick={() => openExternal(DART_SEARCH)}
            withTouchEffect
            contents={
              <Text typography="t6" fontWeight="medium" color={adaptive.grey900}>
                DART 전자공시에서 보기
              </Text>
            }
            right={<ChevronRightIcon color={adaptive.grey400} />}
          />
        </SectionCard>
      )}
    </Screen>
  );
}

function BackBar({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ padding: "8px 12px 0" }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로"
        style={{
          background: "none",
          border: "none",
          padding: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
          <ChevronRightIcon color={adaptive.grey700} size={24} />
        </span>
      </button>
    </div>
  );
}
