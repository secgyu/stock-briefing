import { useCallback, useEffect, useState } from "react";
import { storageGet, storageSet } from "./storage";
import type { EarningsEvent, Market, WatchItem } from "../types";

/** 관심종목에 다음 실적(upcoming은 미래·오름차순이라 첫 매치)을 붙여 임박순 정렬. 일정 없으면 뒤로. */
export function withNextEarnings(
  items: WatchItem[],
  upcoming: EarningsEvent[],
): Array<{ item: WatchItem; next?: EarningsEvent }> {
  return items
    .map((item) => ({ item, next: upcoming.find((e) => e.symbol === item.symbol) }))
    .sort((a, b) => {
      if (!a.next) return 1;
      if (!b.next) return -1;
      return a.next.date.localeCompare(b.next.date);
    });
}

// v2: 첫 실행 기본 관심종목(mock) 시딩 제거 → 빈 목록으로 시작.
const KEY = "stock-briefing:watchlist:v2";

export async function loadWatchlist(): Promise<WatchItem[]> {
  const raw = await storageGet(KEY);
  if (raw == null) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WatchItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveWatchlist(items: WatchItem[]): Promise<void> {
  await storageSet(KEY, JSON.stringify(items));
}

export interface UseWatchlist {
  items: WatchItem[];
  loaded: boolean;
  isWatched: (symbol: string) => boolean;
  toggle: (item: { symbol: string; name: string; market: Market }) => void;
  remove: (symbol: string) => void;
}

/** 관심종목 상태를 로컬 저장소와 동기화하는 훅 */
export function useWatchlist(): UseWatchlist {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadWatchlist().then((list) => {
      if (alive) {
        setItems(list);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: WatchItem[]) => {
    setItems(next);
    void saveWatchlist(next);
  }, []);

  const isWatched = useCallback((symbol: string) => items.some((i) => i.symbol === symbol), [items]);

  const toggle = useCallback(
    (item: { symbol: string; name: string; market: Market }) => {
      const exists = items.some((i) => i.symbol === item.symbol);
      persist(
        exists
          ? items.filter((i) => i.symbol !== item.symbol)
          : [...items, { ...item, addedAt: new Date().toISOString() }],
      );
    },
    [items, persist],
  );

  const remove = useCallback((symbol: string) => persist(items.filter((i) => i.symbol !== symbol)), [items, persist]);

  return { items, loaded, isWatched, toggle, remove };
}
