import { ListRow, TextField, Top } from "@toss/tds-mobile";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useDebouncedValue, useUpcomingEarnings } from "../lib/hooks";
import { marketFlag } from "../lib/format";
import { logoCandidates } from "../lib/logo";
import { queryStatus } from "../lib/queryClient";
import { type UseWatchlist, withNextEarnings } from "../lib/watchlist";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { StarToggle, TwoLine, WatchRow } from "../components/rows";
import { AsyncSection, EmptyState, InlineError } from "../components/states";
import { StockAvatar } from "../components/StockAvatar";

export function WatchScreen({
  watchlist,
  onOpenStock,
}: {
  watchlist: UseWatchlist;
  onOpenStock: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const debouncedQ = useDebouncedValue(q);

  // 검색어별로 캐시. 타이핑 중엔 이전 결과를 유지해 깜빡임을 없앤다.
  const search = useQuery({
    queryKey: ["symbols", debouncedQ],
    queryFn: () => api.symbols(debouncedQ),
    enabled: debouncedQ !== "",
    placeholderData: keepPreviousData,
  });

  // 관심종목의 "다음 실적"은 다가오는 실적 전체에서 파생한다(Home/Calendar와 캐시 공유).
  const upcoming = useUpcomingEarnings();
  const sortedWatch = useMemo(
    () => withNextEarnings(watchlist.items, upcoming.data ?? []),
    [watchlist.items, upcoming.data],
  );

  return (
    <Screen>
      <Top title={<Top.TitleParagraph size={22}>관심</Top.TitleParagraph>} />

      <div style={{ padding: "4px 16px 12px" }}>
        <TextField
          variant="box"
          placeholder="종목명 또는 티커 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {q !== "" ? (
        <SectionCard>
          <SectionHeader title="검색 결과" />
          <AsyncSection
            status={queryStatus(search)}
            data={search.data ?? []}
            onRetry={() => void search.refetch()}
            empty={<EmptyState title="검색 결과가 없어요" description="다른 종목명이나 티커로 검색해 보세요." />}
          >
            {(list) =>
              list.map((s) => (
                <ListRow
                  key={s.symbol}
                  onClick={() => onOpenStock(s.symbol)}
                  withTouchEffect
                  left={<StockAvatar name={s.name} seed={s.symbol} logoUrls={logoCandidates(s.symbol, s.market)} />}
                  contents={<TwoLine title={s.name} sub={`${marketFlag(s.market)} ${s.symbol} · ${s.exchange}`} />}
                  right={
                    <StarToggle
                      on={watchlist.isWatched(s.symbol)}
                      onClick={() => watchlist.toggle({ symbol: s.symbol, name: s.name, market: s.market })}
                    />
                  }
                />
              ))
            }
          </AsyncSection>
        </SectionCard>
      ) : (
        <SectionCard>
          <SectionHeader title="관심종목" />
          {!watchlist.loaded ? null : sortedWatch.length === 0 ? (
            <EmptyState
              title="아직 관심종목이 없어요"
              description="위 검색창에서 종목을 찾아 별표를 눌러 추가하세요."
            />
          ) : (
            <>
              {upcoming.isError && (
                <InlineError message="실적 일정을 불러오지 못했어요" onRetry={() => void upcoming.refetch()} />
              )}
              {sortedWatch.map(({ item, next }) => (
                <WatchRow
                  key={item.symbol}
                  item={item}
                  next={next}
                  onClick={() => onOpenStock(item.symbol)}
                  onRemove={() => watchlist.remove(item.symbol)}
                />
              ))}
            </>
          )}
        </SectionCard>
      )}
    </Screen>
  );
}
