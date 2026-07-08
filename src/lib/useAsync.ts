import { useCallback, useEffect, useState } from "react";

export type AsyncStatus = "loading" | "error" | "ready";

/**
 * Promise를 반환하는 factory를 실행해 로딩/에러/완료 상태를 관리한다.
 * deps가 바뀌거나 retry() 호출 시 다시 불러온다.
 */
export function useAsync<T>(
  factory: () => Promise<T>,
  deps: unknown[] = [],
): {
  status: AsyncStatus;
  data: T | null;
  retry: () => void;
} {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    factory()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
    // factory는 매 렌더 새로 생성되므로 nonce/deps로만 갱신한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { status, data, retry };
}
