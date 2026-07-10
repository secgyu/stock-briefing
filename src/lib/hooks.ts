import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { isKr, isKrMarketOpen, isUsMarketOpen } from "./market";

/** 값이 ms 동안 바뀌지 않을 때만 반영 (검색 입력 디바운스용) */
export function useDebouncedValue<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const POLL_MS = 30_000;

/** 종목 시세 쿼리. 해당 시장 정규장 중에만 30초 주기로 자동 갱신(장 마감/백그라운드면 멈춤). */
export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => api.quote(symbol),
    staleTime: 0, // 재진입·포커스 복귀 때 항상 최신 시세로
    // 국내는 Yahoo 20분 지연이라 장중엔 값이 움직인다.
    refetchInterval: () => ((isKr(symbol) ? isKrMarketOpen() : isUsMarketOpen()) ? POLL_MS : false),
  });
}
