import { QueryClient } from "@tanstack/react-query";

export type AsyncStatus = "loading" | "error" | "ready";

/** react-query 결과를 AsyncSection이 쓰는 3-상태로 매핑. */
export function queryStatus(q: { isPending: boolean; isError: boolean }): AsyncStatus {
  return q.isPending ? "loading" : q.isError ? "error" : "ready";
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000, // 5분간 fresh: 탭 오갈 때 재요청 안 함
      gcTime: 30 * 60_000, // 30분간 캐시 보관
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
