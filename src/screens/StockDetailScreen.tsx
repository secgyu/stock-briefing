import { useQuery } from "@tanstack/react-query";
import { adaptive } from "@toss/tds-colors";
import { Button, ListRow, Text, Top } from "@toss/tds-mobile";
import { api } from "../api/client";
import { useQuote } from "../lib/hooks";
import { isKr, isKrMarketOpen, isUsMarketOpen } from "../lib/market";
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
import { PlainButton, SectionCard, SectionHeader, Screen } from "../components/layout";
import { NewsRow, TwoLine } from "../components/rows";
import { EmptyState, ErrorState, InlineError, ListSkeleton } from "../components/states";
import { ChevronRightIcon } from "../components/icons";
import type { Disclosure, EarningsEvent, NewsItem, Quote, SymbolInfo } from "../types";

const DART_SEARCH = "https://dart.fss.or.kr/dsab007/main.do";

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
  const quoteQuery = useQuote(symbol);
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

      {/* quote가 null이면 시세 소스 없는 종목(정상 숨김). 에러는 침묵하지 않고 재시도를 준다. */}
      {quote ? (
        <QuoteHeader quote={quote} />
      ) : quoteQuery.isError ? (
        <InlineError message="시세를 불러오지 못했어요" onRetry={() => void quoteQuery.refetch()} />
      ) : null}

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
                contents={<TwoLine title={d.title} sub={`${d.filer} · ${formatDateKo(d.date)}`} fontWeight="medium" />}
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
  // asOf에 시각(T)이 있으면 장중 시세, 날짜만이면 종가(금융위 폴백).
  const intraday = quote.asOf.includes("T");
  const stamp =
    quote.currency === "KRW"
      ? intraday
        ? isKrMarketOpen()
          ? `20분 지연 · ${formatDateTimeKo(quote.asOf)}`
          : `${formatDateTimeKo(quote.asOf)} 기준`
        : `${formatDateKo(quote.asOf)} 종가 기준`
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
      <PlainButton onClick={onBack} aria-label="뒤로" style={{ padding: 8, display: "flex", alignItems: "center" }}>
        <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
          <ChevronRightIcon color={adaptive.grey700} size={24} />
        </span>
      </PlainButton>
    </div>
  );
}
