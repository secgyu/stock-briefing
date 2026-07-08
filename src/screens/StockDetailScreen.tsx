import { useEffect, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { Button, ListRow, Text, Top } from "@toss/tds-mobile";
import { api } from "../api/client";
import { isUsMarketOpen } from "../lib/market";
import { daysUntil } from "../lib/dday";
import { openExternal } from "../lib/external";
import {
  changeColor,
  earningsTimeLabel,
  formatDateKo,
  formatDateTimeKo,
  formatMarketCap,
  formatPct,
  formatPrice,
  marketFlag,
  marketLabel,
} from "../lib/format";
import { useAsync } from "../lib/useAsync";
import type { UseWatchlist } from "../lib/watchlist";
import { DdayBadge, EstimatedBadge } from "../components/badges";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { NewsRow } from "../components/rows";
import { EmptyState, ErrorState, ListSkeleton } from "../components/states";
import { ChevronRightIcon } from "../components/icons";
import type { EarningsEvent, NewsItem, Quote, SymbolInfo } from "../types";

const DART_SEARCH = "https://dart.fss.or.kr/dsab007/main.do";

interface DetailData {
  info?: SymbolInfo;
  quote: Quote | null;
  next?: EarningsEvent;
  news: NewsItem[];
}

async function loadDetail(symbol: string): Promise<DetailData> {
  const [symbols, earnings, news, quote] = await Promise.all([
    api.symbols(symbol),
    api.earnings(symbol),
    api.news(symbol),
    api.quote(symbol),
  ]);
  const today = new Date();
  const next = earnings.filter((e) => daysUntil(e.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  // 종목 마스터에 없더라도 실적 데이터(심볼·이름·시장)로 최소 정보를 구성해 상세를 보여준다.
  const found = symbols.find((s) => s.symbol === symbol);
  const e0 = earnings[0];
  const info = found ?? (e0 ? { symbol: e0.symbol, name: e0.name, market: e0.market, exchange: "" } : undefined);
  return { info, quote, next, news };
}

const POLL_MS = 30_000;

/**
 * 미국 정규장 중, 화면이 보일 때만 시세를 30초 주기로 폴링한다.
 * 로딩 상태를 건드리지 않고 값만 교체해 깜빡임이 없다. 장 마감/백그라운드면 호출하지 않는다.
 */
function useLiveQuote(symbol: string, initial: Quote | null): Quote | null {
  const [quote, setQuote] = useState<Quote | null>(initial);
  // 초기 로드(또는 종목 변경)로 새 값이 들어오면 반영.
  useEffect(() => setQuote(initial), [initial]);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!isUsMarketOpen()) return;
      try {
        const fresh = await api.quote(symbol);
        if (alive && fresh) setQuote(fresh);
      } catch {
        // 폴링 실패는 조용히 무시하고 다음 주기에 재시도
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [symbol]);
  return quote;
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
  const liveQuote = useLiveQuote(symbol, data?.quote ?? null);

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
  const quote = liveQuote;
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
            {marketFlag(info.market)} {info.symbol} · {info.exchange || marketLabel(info.market)}
          </Top.SubtitleParagraph>
        }
      />

      {quote && <QuoteHeader quote={quote} />}

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

function QuoteHeader({ quote }: { quote: Quote }) {
  const color = changeColor(quote.changePct);
  const sign = quote.change > 0 ? "+" : "";
  const cap = formatMarketCap(quote.marketCap);
  return (
    <div style={{ padding: "0 24px 8px" }}>
      <Text typography="t1" fontWeight="bold" color={adaptive.grey900}>
        {formatPrice(quote.price, quote.currency)}
      </Text>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <Text typography="t5" fontWeight="bold" color={color}>
          {formatPct(quote.changePct)}
        </Text>
        <Text typography="t6" color={color}>
          {sign}
          {formatPrice(quote.change, quote.currency)}
        </Text>
      </div>
      <Text typography="t7" color={adaptive.grey500} style={{ display: "block", marginTop: 6 }}>
        {cap ? `시가총액 ${cap} · ` : ""}
        {isUsMarketOpen() ? `실시간 · ${formatDateTimeKo(quote.asOf)}` : `${formatDateTimeKo(quote.asOf)} 기준`}
      </Text>
    </div>
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
