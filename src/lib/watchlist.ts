import { Storage } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_WATCHLIST } from "../mock/dummy";
import type { Market, WatchItem } from "../types";

const KEY = "stock-briefing:watchlist";

// ponytail: 브라우저(토스 브릿지 없음)에서는 SDK Storage 호출이 멈춰있을 수 있어
// 500ms 안에 응답 없으면 localStorage로 폴백한다. 실기기에선 즉시 응답하므로 무해.
function withTimeout<T>(p: Promise<T>, ms = 500): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("storage timeout")), ms))]);
}

async function readRaw(): Promise<string | null> {
  try {
    return await withTimeout(Storage.getItem(KEY));
  } catch {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
}

async function writeRaw(value: string): Promise<void> {
  try {
    await withTimeout(Storage.setItem(KEY, value));
  } catch {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* 저장 불가 환경: 이번 세션 메모리로만 유지 */
    }
  }
}

export async function loadWatchlist(): Promise<WatchItem[]> {
  const raw = await readRaw();
  if (raw == null) {
    await writeRaw(JSON.stringify(DEFAULT_WATCHLIST));
    return DEFAULT_WATCHLIST;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WatchItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveWatchlist(items: WatchItem[]): Promise<void> {
  await writeRaw(JSON.stringify(items));
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
