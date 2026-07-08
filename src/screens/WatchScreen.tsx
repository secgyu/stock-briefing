import { adaptive } from "@toss/tds-colors";
import { ListRow, Text, TextField, Top } from "@toss/tds-mobile";
import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { ddayLabel } from "../lib/dday";
import { marketFlag } from "../lib/format";
import { logoCandidates } from "../lib/logo";
import { queryStatus } from "../lib/queryClient";
import type { UseWatchlist } from "../lib/watchlist";
import { DdayBadge } from "../components/badges";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { StarToggle } from "../components/rows";
import { AsyncSection, EmptyState } from "../components/states";
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

  // 키 입력마다 워커를 때리지 않도록 250ms 디바운스.
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  // 검색어별로 캐시. 타이핑 중엔 이전 결과를 유지해 깜빡임을 없앤다.
  const search = useQuery({
    queryKey: ["symbols", debouncedQ],
    queryFn: () => api.symbols(debouncedQ),
    enabled: debouncedQ !== "",
    placeholderData: keepPreviousData,
  });

  // 관심종목의 "다음 실적"은 다가오는 실적 전체에서 파생한다.
  const upcoming = useQuery({ queryKey: ["earnings", "upcoming"], queryFn: api.upcomingEarnings });
  const nextOf = (symbol: string) => (upcoming.data ?? []).find((e) => e.symbol === symbol);

  const sortedWatch = useMemo(
    () =>
      watchlist.items
        .map((w) => ({ item: w, next: nextOf(w.symbol) }))
        .sort((a, b) => {
          if (!a.next) return 1;
          if (!b.next) return -1;
          return a.next.date.localeCompare(b.next.date);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  contents={
                    <div>
                      <Text typography="t6" fontWeight="bold" color={adaptive.grey900}>
                        {s.name}
                      </Text>
                      <div style={{ marginTop: 2 }}>
                        <Text typography="t7" color={adaptive.grey500}>
                          {marketFlag(s.market)} {s.symbol} · {s.exchange}
                        </Text>
                      </div>
                    </div>
                  }
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
            sortedWatch.map(({ item, next }) => (
              <ListRow
                key={item.symbol}
                onClick={() => onOpenStock(item.symbol)}
                withTouchEffect
                left={
                  <StockAvatar
                    name={item.name}
                    seed={item.symbol}
                    logoUrls={logoCandidates(item.symbol, item.market)}
                  />
                }
                contents={
                  <div>
                    <Text typography="t6" fontWeight="bold" color={adaptive.grey900}>
                      {item.name}
                    </Text>
                    <div style={{ marginTop: 2 }}>
                      <Text typography="t7" color={adaptive.grey500}>
                        {marketFlag(item.market)} {next ? `다음 실적 ${ddayLabel(next.date)}` : "예정 일정 없음"}
                      </Text>
                    </div>
                  </div>
                }
                right={
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {next && <DdayBadge date={next.date} />}
                    <StarToggle on onClick={() => watchlist.remove(item.symbol)} />
                  </div>
                }
              />
            ))
          )}
        </SectionCard>
      )}
    </Screen>
  );
}
