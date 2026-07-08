import { adaptive } from "@toss/tds-colors";
import { Button, Skeleton, Text } from "@toss/tds-mobile";
import type { ReactNode } from "react";
import type { AsyncStatus } from "../lib/queryClient";

/** 빈 상태: 안내 문구 + (선택) 액션 버튼 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "36px 24px",
        textAlign: "center",
      }}
    >
      <Text typography="t5" fontWeight="bold" color={adaptive.grey800}>
        {title}
      </Text>
      {description != null && (
        <Text typography="t7" color={adaptive.grey500}>
          {description}
        </Text>
      )}
      {actionLabel != null && (
        <div style={{ marginTop: 12 }}>
          <Button size="small" variant="weak" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/** 에러 상태: 재시도 버튼 포함 */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "36px 24px",
        textAlign: "center",
      }}
    >
      <Text typography="t5" fontWeight="bold" color={adaptive.grey800}>
        정보를 불러오지 못했어요
      </Text>
      <Text typography="t7" color={adaptive.grey500}>
        잠시 후 다시 시도해 주세요.
      </Text>
      {onRetry != null && (
        <div style={{ marginTop: 12 }}>
          <Button size="small" variant="weak" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}

/** 리스트 로딩 스켈레톤 */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ padding: "8px 20px" }}>
      <Skeleton pattern="subtitleListWithIcon" repeatLastItemCount={rows} />
    </div>
  );
}

/** 상태에 따라 로딩/에러/빈/콘텐츠를 렌더 */
export function AsyncSection<T>({
  status,
  data,
  onRetry,
  skeleton,
  empty,
  children,
}: {
  status: AsyncStatus;
  data: T[];
  onRetry?: () => void;
  skeleton?: ReactNode;
  empty: ReactNode;
  children: (data: T[]) => ReactNode;
}) {
  if (status === "loading") return <>{skeleton ?? <ListSkeleton />}</>;
  if (status === "error") return <ErrorState onRetry={onRetry} />;
  if (data.length === 0) return <>{empty}</>;
  return <>{children(data)}</>;
}
