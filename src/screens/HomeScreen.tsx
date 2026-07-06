import { Top } from "@toss/tds-mobile";
import { daysUntil } from "../lib/dday";
import { openExternal } from "../lib/external";
import { useAsyncMock } from "../lib/useAsyncMock";
import type { UseWatchlist } from "../lib/watchlist";
import { MOCK_EARNINGS, MOCK_IPOS, MOCK_MARKET_NEWS, MOCK_SECTORS, nextEarningsFor } from "../mock/dummy";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { EarningsRow, IpoRow, NewsRow, SectorRow } from "../components/rows";
import { AsyncSection, EmptyState, ListSkeleton } from "../components/states";
import type { EarningsEvent, IpoEvent, NewsItem, SectorRank } from "../types";

interface HomeData {
  upcoming: EarningsEvent[];
  ipos: IpoEvent[];
  sectors: SectorRank[];
  news: NewsItem[];
}

function loadHome(): HomeData {
  const today = new Date();
  return {
    upcoming: MOCK_EARNINGS.filter((e) => daysUntil(e.date, today) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5),
    ipos: MOCK_IPOS.filter((i) => daysUntil(i.date, today) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5),
    sectors: MOCK_SECTORS.slice(0, 5),
    news: MOCK_MARKET_NEWS.slice(0, 5),
  };
}

export function HomeScreen({
  watchlist,
  onOpenStock,
  onGoWatch,
  onGoCalendar,
}: {
  watchlist: UseWatchlist;
  onOpenStock: (symbol: string) => void;
  onGoWatch: () => void;
  onGoCalendar: () => void;
}) {
  const { status, data, retry } = useAsyncMock(loadHome);

  const watched = watchlist.items
    .map((w) => ({ item: w, next: nextEarningsFor(w.symbol) }))
    .sort((a, b) => {
      if (!a.next) return 1;
      if (!b.next) return -1;
      return a.next.date.localeCompare(b.next.date);
    });

  return (
    <Screen>
      <Top title={<Top.TitleParagraph size={22}>주식브리핑</Top.TitleParagraph>} />

      <SectionCard>
        <SectionHeader title="내 관심종목" moreLabel="관심 관리" onMore={onGoWatch} />
        {!watchlist.loaded ? (
          <ListSkeleton rows={2} />
        ) : watched.length === 0 ? (
          <EmptyState
            title="아직 관심종목이 없어요"
            description="종목을 추가하면 실적발표가 가까운 순으로 보여드려요."
            actionLabel="종목 검색해서 추가하기"
            onAction={onGoWatch}
          />
        ) : (
          watched.map(({ item, next }) =>
            next ? (
              <EarningsRow
                key={item.symbol}
                event={{ ...next, name: item.name }}
                watched
                onToggle={() => watchlist.toggle(item)}
                onClick={() => onOpenStock(item.symbol)}
              />
            ) : null,
          )
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="실적발표 임박" moreLabel="더 보기" onMore={onGoCalendar} />
        <AsyncSection
          status={status}
          data={data?.upcoming ?? []}
          onRetry={retry}
          empty={<EmptyState title="예정된 실적발표가 없어요" />}
        >
          {(list) =>
            list.map((e) => (
              <EarningsRow
                key={`${e.symbol}-${e.date}`}
                event={e}
                watched={watchlist.isWatched(e.symbol)}
                onToggle={() => watchlist.toggle(e)}
                onClick={() => onOpenStock(e.symbol)}
              />
            ))
          }
        </AsyncSection>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="오늘·이번주 상장" moreLabel="더 보기" onMore={onGoCalendar} />
        <AsyncSection
          status={status}
          data={data?.ipos ?? []}
          onRetry={retry}
          empty={<EmptyState title="예정된 상장 일정이 없어요" />}
        >
          {(list) => list.map((i) => <IpoRow key={`${i.name}-${i.date}`} ipo={i} />)}
        </AsyncSection>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="지금 뜨는 산업" caption="객관적 지표(주간 등락률) 기준이에요" />
        <AsyncSection
          status={status}
          data={data?.sectors ?? []}
          onRetry={retry}
          empty={<EmptyState title="집계된 지표가 없어요" />}
        >
          {(list) => list.map((s) => <SectorRow key={`${s.market}-${s.name}`} sector={s} />)}
        </AsyncSection>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="주요 뉴스" />
        <AsyncSection
          status={status}
          data={data?.news ?? []}
          onRetry={retry}
          empty={<EmptyState title="표시할 뉴스가 없어요" />}
        >
          {(list) => list.map((n) => <NewsRow key={n.url} news={n} onClick={() => openExternal(n.url)} />)}
        </AsyncSection>
      </SectionCard>

      <DisclaimerFooter />
    </Screen>
  );
}
