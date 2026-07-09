import { useQuery } from "@tanstack/react-query";
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
import { queryStatus } from "../lib/queryClient";
import type { UseWatchlist } from "../lib/watchlist";
import { DdayBadge, EstimatedBadge } from "../components/badges";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { NewsRow } from "../components/rows";
import { EmptyState, ErrorState, ListSkeleton } from "../components/states";
import { ChevronRightIcon } from "../components/icons";
import type { Disclosure, EarningsEvent, NewsItem, Quote, SymbolInfo } from "../types";

const DART_SEARCH = "https://dart.fss.or.kr/dsab007/main.do";

/** 6자리 숫자면 국내 종목. 국내만 DART 공시를 조회한다. */
const isKr = (s: string) => /^\d{6}$/.test(s);

interface DetailData {
  info?: SymbolInfo;
  next?: EarningsEvent;
  news: NewsItem[];
  disclosures: Disclosure[];
}

async function loadDetail(symbol: string): Promise<DetailData> {
  const [symbols, earnings, news, disclosures] = await Promise.all([
    api.symbols(symbol),
    api.earnings(symbol),
    api.news(symbol),
    isKr(symbol) ? api.disclosures(symbol) : Promise.resolve<Disclosure[]>([]),
  ]);
  const today = new Date();
  const next = earnings.filter((e) => daysUntil(e.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  // 종목 마스터에 없더라도 실적 데이터(심볼·이름·시장)로 최소 정보를 구성해 상세를 보여준다.
  const found = symbols.find((s) => s.symbol === symbol);
  const e0 = earnings[0];
  const info = found ?? (e0 ? { symbol: e0.symbol, name: e0.name, market: e0.market, exchange: "" } : undefined);
  return { info, next, news, disclosures };
}

const POLL_MS = 30_000;

export function StockDetailScreen({
  symbol,
  watchlist,
  onBack,
}: {
  symbol: string;
  watchlist: UseWatchlist;
  onBack: () => void;
}) {
  const detail = useQuery({ queryKey: ["detail", symbol], queryFn: () => loadDetail(symbol) });
  // 시세는 별도 쿼리로 분리: 미국 정규장 중에만 30초 주기로 자동 갱신(장 마감/백그라운드면 멈춤).
  const quoteQuery = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => api.quote(symbol),
    staleTime: 0, // 재진입·포커스 복귀 때 항상 최신 시세로
    // 미국 정규장 중에만 폴링. 국내는 전일 종가라 폴링 의미가 없다.
    refetchInterval: () => (!isKr(symbol) && isUsMarketOpen() ? POLL_MS : false),
  });
  const status = queryStatus(detail);
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
        <ErrorState onRetry={() => void detail.refetch()} />
      </Screen>
    );
  }

  const data = detail.data;
  const info = data?.info;
  const quote = quoteQuery.data ?? null;
  const next = data?.next;
  const news = data?.news ?? [];
  const disclosures = data?.disclosures ?? [];

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
          <SectionHeader title="최근 공시" caption="금융감독원 전자공시(DART)" />
          {disclosures.length === 0 ? (
            <EmptyState title="최근 공시가 없어요" />
          ) : (
            disclosures.map((d) => (
              <ListRow
                key={d.url}
                onClick={() => openExternal(d.url)}
                withTouchEffect
                contents={
                  <div>
                    <Text typography="t6" fontWeight="medium" color={adaptive.grey900}>
                      {d.title}
                    </Text>
                    <div style={{ marginTop: 2 }}>
                      <Text typography="t7" color={adaptive.grey500}>
                        {d.filer} · {formatDateKo(d.date)}
                      </Text>
                    </div>
                  </div>
                }
                right={<ChevronRightIcon color={adaptive.grey400} />}
              />
            ))
          )}
          <ListRow
            onClick={() => openExternal(DART_SEARCH)}
            withTouchEffect
            contents={
              <Text typography="t7" fontWeight="medium" color={adaptive.blue500}>
                DART에서 전체 공시 보기
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
  const cap = formatMarketCap(quote.marketCap, quote.currency);
  // 국내는 전일 종가(asOf=YYYY-MM-DD) → "종가 기준", 미국은 장중이면 "실시간".
  const stamp =
    quote.currency === "KRW"
      ? `${formatDateKo(quote.asOf)} 종가 기준`
      : isUsMarketOpen()
        ? `실시간 · ${formatDateTimeKo(quote.asOf)}`
        : `${formatDateTimeKo(quote.asOf)} 기준`;
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
        {stamp}
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
