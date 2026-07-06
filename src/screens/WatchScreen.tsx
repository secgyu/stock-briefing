import { adaptive } from "@toss/tds-colors";
import { ListRow, Text, TextField, Top } from "@toss/tds-mobile";
import { useMemo, useState } from "react";
import { ddayLabel } from "../lib/dday";
import { marketFlag } from "../lib/format";
import type { UseWatchlist } from "../lib/watchlist";
import { MOCK_SYMBOLS, nextEarningsFor } from "../mock/dummy";
import { DdayBadge } from "../components/badges";
import { SectionCard, SectionHeader, Screen } from "../components/layout";
import { StarToggle } from "../components/rows";
import { EmptyState } from "../components/states";
import { StockAvatar } from "../components/StockAvatar";
import type { SymbolInfo } from "../types";

export function WatchScreen({
  watchlist,
  onOpenStock,
}: {
  watchlist: UseWatchlist;
  onOpenStock: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo<SymbolInfo[]>(() => {
    if (q === "") return [];
    return MOCK_SYMBOLS.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q)).slice(
      0,
      20,
    );
  }, [q]);

  const sortedWatch = useMemo(
    () =>
      watchlist.items
        .map((w) => ({ item: w, next: nextEarningsFor(w.symbol) }))
        .sort((a, b) => {
          if (!a.next) return 1;
          if (!b.next) return -1;
          return a.next.date.localeCompare(b.next.date);
        }),
    [watchlist.items],
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
          {results.length === 0 ? (
            <EmptyState title="검색 결과가 없어요" description="다른 종목명이나 티커로 검색해 보세요." />
          ) : (
            results.map((s) => (
              <ListRow
                key={s.symbol}
                onClick={() => onOpenStock(s.symbol)}
                withTouchEffect
                left={<StockAvatar name={s.name} seed={s.symbol} />}
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
          )}
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
                left={<StockAvatar name={item.name} seed={item.symbol} />}
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
