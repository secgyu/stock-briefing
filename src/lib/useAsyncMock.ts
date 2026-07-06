import { useCallback, useEffect, useState } from "react";

export type AsyncStatus = "loading" | "error" | "ready";

/**
 * 더미데이터를 잠깐의 지연 후 반환해 로딩 스켈레톤을 실제처럼 보여준다.
 * P4에서 이 훅을 실제 API 호출로 교체한다. (인터페이스는 그대로 유지)
 */
export function useAsyncMock<T>(
  factory: () => T,
  delay = 450,
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
    const timer = setTimeout(() => {
      if (!alive) return;
      setData(factory());
      setStatus("ready");
    }, delay);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // factory는 매 렌더 새로 생성되므로 의도적으로 nonce로만 갱신한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, delay]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { status, data, retry };
}
