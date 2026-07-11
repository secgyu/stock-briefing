import { Component, type ReactNode } from "react";
import { ErrorState } from "./states";

/** 렌더 예외 1건이 앱 전체 백지로 번지는 걸 막는다. 복구는 리로드(세션 저장으로 화면 위치 복원됨). */
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error("render error:", error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ paddingTop: 120 }}>
          <ErrorState onRetry={() => location.reload()} />
        </div>
      );
    }
    return this.props.children;
  }
}
